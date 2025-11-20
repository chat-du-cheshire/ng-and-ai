import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatChipGrid,
  MatChipInput,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';

import { ShowsLoader } from '../../core/shows-loader';
import { Snackbar } from '../../core/snackbar';
import {
  completionResource,
  structuredCompletionResource,
} from '@hashbrownai/angular';
import { NEW_SHOW_SCHEMA } from '../../shared/show-schema';
import { s } from '@hashbrownai/core';
import {
  MatProgressSpinner,
  MatSpinner,
} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-show-form',
  templateUrl: './show-form.html',
  styleUrl: './show-form.scss',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatChipInput,
    MatChipRemove,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatButton,
    MatProgressSpinner,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowForm {
  #showsLoader = inject(ShowsLoader);
  #snackBar = inject(Snackbar);

  showForm = inject(FormBuilder).group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    rating: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(10)],
    ],
    year: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear()),
      ],
    ],
    genres: [[] as string[], Validators.required],
    imageUrl: ['', Validators.required],
  });

  #finalShowTitle = signal('');
  #titleValueChange = toSignal(this.showForm.controls.title.valueChanges);
  genreValueChange = toSignal(this.showForm.controls.genres.valueChanges);
  separatorKeysCodes = [ENTER, COMMA];

  showNameCompletion = completionResource({
    model: 'gpt-4o',
    system: `
    You are an assistant that autocompletes names of popular TV shows.

    ## Rules
    - Always return exactly one suggestion.
    - The suggestion must begin **exactly** with the user's input (preserve the prefix without changes).
    - Complete the input into the full title of a well-known TV show.
    - Do not return any title that does not start with the input.
    - If no valid TV show matches the prefix, return an empty string.

    ## Examples
    - Input: {input: "Breaking"}
    - Output: Breaking Bad

    - Input: {input: "Game of"}
    - Output: Game of Thrones

    - Input: {input: "Stran"}
    - Output: Stranger Things
    `,
    input: this.#titleValueChange,
  });

  showCompletion = structuredCompletionResource({
    model: 'gpt-4o',
    system: `
    You are an assistant that predicts properties for popular TV shows based on the title
    the user is typing. Your suggestions are displayed as floating cards to help the user
    complete the show form.

    What to return:
    - A prediction with all required fields of the schema.
    - Each prediction MUST include a concise "reasonForSuggestion" explaining why it matches the typed title.

    Data rules:
    - description: A description that describes what the TV show is all about.
    - rating: number between 1 and 10.
    - year: plausible first release year of the show.
    - genres: array of genre strings (e.g., ["Drama", "Crime"]).
    - imageUrl: a plausible poster/thumbnail URL (use a generic placeholder if unknown).

    Output format:
    - Strictly follow the provided schema.
    - No extra fields. No markdown.
    `,
    schema: s.object('New show properties', {
      newShow: NEW_SHOW_SCHEMA,
    }),
    input: this.#finalShowTitle,
  });

  #fillCompletionsEffect = effect(() => {
    this.showForm.controls.description.enable();
    this.showForm.controls.year.enable();
    this.showForm.controls.rating.enable();
    this.showForm.controls.imageUrl.enable();

    this.showForm.patchValue({ ...this.showCompletion.value()?.newShow });
  });

  completeHint() {
    const completionValue = this.showNameCompletion.value();
    if (completionValue) {
      this.showForm.controls.title.setValue(completionValue, {
        emitEvent: false,
      });
      this.#finalShowTitle.set(completionValue);
    }
  }

  add(event: any): void {
    const newValue = event.value.trim();
    if (newValue) {
      this.showForm.controls.genres.patchValue([
        ...this.showForm.controls.genres.value!,
        newValue,
      ]);
      event.chipInput!.clear();
    }
  }

  remove(genre: string): void {
    const newValue = this.showForm.controls.genres.value!.filter(
      (g) => g !== genre,
    );
    this.showForm.controls.genres.patchValue(newValue);
  }

  resetForm() {
    this.showForm.reset();
  }

  async submit() {
    if (this.showForm.valid) {
      try {
        const title = this.showForm.controls.title.value!;
        await firstValueFrom(
          this.#showsLoader.add({
            title,
            description: this.showForm.controls.description.value!,
            rating: this.showForm.controls.rating.value!,
            year: this.showForm.controls.year.value!,
            genres: this.showForm.controls.genres.value!,
            imageUrl: this.showForm.controls.imageUrl.value!,
          }),
        );
        this.resetForm();
        this.#snackBar.open(`Show "${title}" was successfully added`);
      } catch (error) {
        this.#snackBar.open('Something went wrong while adding a new Show');
      }
    }
  }
}
