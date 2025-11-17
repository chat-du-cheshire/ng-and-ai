import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-theme-switch',
  template: `
    <button matFab aria-label="Toggle theme" (click)="toggleTheme()">
      <mat-icon>{{ isDarkTheme() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  imports: [MatFabButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitch {
  #document = inject(DOCUMENT);
  isDarkTheme = signal(
    this.#document.body.style.getPropertyValue('color-scheme') === 'dark',
  );

  toggleTheme() {
    this.isDarkTheme.update((dark) => !dark);
    this.#document.body.style.setProperty(
      'color-scheme',
      this.isDarkTheme() ? 'dark' : 'light',
    );
  }
}
