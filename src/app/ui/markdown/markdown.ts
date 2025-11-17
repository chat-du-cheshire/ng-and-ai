import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-markdown',
  template: ` <markdown [data]="data()" class="app-markdown"></markdown> `,
  styleUrl: './markdown.scss',
  imports: [MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Markdown {
  data = input.required<string>();
}
