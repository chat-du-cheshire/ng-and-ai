import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, switchMap } from 'rxjs';

import { ShowDetails } from '../../ui/shows/show-details/show-details';
import { ShowsLoader } from '../../core/shows-loader';

@Component({
  selector: 'app-shows',
  template: `
    <div class="shows-container">
      @for (show of shows(); track show.id) {
        <app-show-details [show]="show" />
      }
    </div>
  `,
  styles: [
    `
      .shows-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
    `,
  ],
  imports: [ShowDetails],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shows {
  #showsLoader = inject(ShowsLoader);

  showIds = input.required<string[]>();

  shows = toSignal(
    toObservable(this.showIds).pipe(
      switchMap((ids) =>
        ids.length > 0
          ? forkJoin(ids.map((id) => this.#showsLoader.loadById(id)))
          : [],
      ),
    ),
    { initialValue: [] },
  );
}
