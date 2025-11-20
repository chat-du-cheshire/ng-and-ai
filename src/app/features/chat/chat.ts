import { Chart } from 'chart.js/auto';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  model,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatFabButton } from '@angular/material/button';
import {
  chatResource,
  createRuntime,
  createRuntimeFunction,
  createTool,
  createToolJavaScript,
  exposeComponent,
  RenderMessageComponent,
  uiChatResource,
} from '@hashbrownai/angular';
import { MatCard, MatCardContent } from '@angular/material/card';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ShowsLoader } from '../../core/shows-loader';
import { Shows } from '../../pattern/shows/shows';
import { s } from '@hashbrownai/core';
import { LoadingIndicator } from '../../ui/loading-indicator/loading-indicator';
import { ThemeSwitch } from '../../ui/theme-switch/theme-switch';
import { Markdown } from '../../ui/markdown/markdown';
import { ShowForm } from '../../pattern/show-form/show-form';
import { FormsModule, NgModel } from '@angular/forms';
import { PIE_CHART_SCHEMA } from '../../shared/pie-chart-schema';

@Component({
  selector: 'app-chat',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatFabButton,
    MatIcon,
    MatLabel,
    MatCard,
    MatCardContent,
    RenderMessageComponent,
    LoadingIndicator,
    FormsModule,
  ],
  template: `
    <div class="chat-container">
      <div class="chat-input-wrapper">
        <div class="chat-input">
          <mat-form-field>
            <mat-label>How can I help you?</mat-label>
            <input
              #inputField
              matInput
              [(ngModel)]="chatModel"
              (keydown.enter)="sendMessage()"
            />
          </mat-form-field>

          <button
            matFab
            color="primary"
            class="send-button"
            aria-label="Send message"
            (click)="sendMessage()"
          >
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>

      <div class="chat-messages">
        @for (message of chat.value(); track $index) {
          @if (message.content) {
            @switch (message.role) {
              @case ('user') {
                <mat-card #userMessage class="message user">
                  <mat-card-content>
                    <p>{{ message.content }}</p>
                  </mat-card-content>
                </mat-card>
              }
              @case ('assistant') {
                @if (message.content) {
                  <div class="assistant-message-container">
                    <div class="assistant-avatar">
                      <mat-icon
                        aria-hidden="false"
                        aria-label="Assistant avatar"
                        fontIcon="face_2"
                      ></mat-icon>
                    </div>
                    <mat-card class="message assistant">
                      <mat-card-content>
                        <hb-render-message [message]="message" />
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <canvas
                    #canvasRef
                    class="chart-canvas"
                    aria-hidden="true"
                  ></canvas>
                }
              }
            }
          }
        }
        @if (chat.isLoading()) {
          <app-loading-indicator />
        }
      </div>
    </div>
  `,
  styleUrl: './chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chat {
  #showsLoader = inject(ShowsLoader);
  #chartArgs = signal<s.Infer<typeof PIE_CHART_SCHEMA> | null>(null);
  chatModel = model('');

  userMessageEls = viewChildren('userMessage', { read: ElementRef });
  canvasRefs = viewChildren<ElementRef<HTMLCanvasElement>>('canvasRef');

  #effectRenderChart = effect((onCleanup) => {
    if (this.chat.isLoading()) {
      return;
    }

    const chartConfig = untracked(() => this.#chartArgs());
    const canvas = untracked(() => this.canvasRefs().at(-1)?.nativeElement);

    if (!canvas || !chartConfig) {
      return;
    }

    const chart = new Chart(canvas, {
      ...chartConfig.chart,
      data: {
        labels: chartConfig.chart.data.labels,
        datasets: chartConfig.chart.data.datasets.map((ds) => ({
          ...ds,
          borderColor: ds.borderColor ?? undefined,
          borderWidth: ds.borderWidth ?? undefined,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        elements: {
          arc: { borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1 },
        },
        ...(chartConfig.options ?? {}),
        interaction: chartConfig.options?.interaction ?? undefined, // never pass null
      },
    });

    onCleanup(() => this.#chartArgs.set(null));
  });

  #runtime = createRuntime({
    functions: [
      createRuntimeFunction({
        name: 'getShowGenres',
        description: `Fetches the list of available show genres from the data source.
        Returns them in a structured array conforming to the "showSchema".
        Useful for building charts or visualizations that categorize shows by genre.`,
        result: s.array(
          'categorized show genres',
          s.object('genre info', {
            genre: s.string('name of the show genre'),
            count: s.number('how many times it appears'),
          }),
        ),
        handler: async (): Promise<any> => {
          return await firstValueFrom(this.#showsLoader.loadGenres());
        },
      }),

      createRuntimeFunction({
        name: 'renderChart',
        description: `
        Renders a chart based on the provided schema.
        Accepts chart configuration (type, data, labels, options) as defined in "chartSchema"
        and updates the internal chart instance. Labels and the chart title are styled using the color #4A90E2.`,
        args: PIE_CHART_SCHEMA,
        handler: async (args) => this.#chartArgs.set(args),
      }),
    ],
  });

  chat = uiChatResource({
    model: 'gpt-4o',
    debugName: 'chat',
    system: `You are a friendly sarcastic chat bot. Reply in markdown for every general question.`,
    tools: [
      createTool({
        name: 'getShows',
        description:
          'A tool to list available TV Shows. Call this tool whenever the user asks for shows',
        handler: () => {
          return lastValueFrom(this.#showsLoader.loadAll());
        },
      }),
      createToolJavaScript({ runtime: this.#runtime }),
    ],
    components: [
      exposeComponent(Shows, {
        description:
          'Render a component when the user asks to view one or more TV shows (e.g., "show X", "list shows", "details for show 123"). Never use for general questions.',
        input: {
          showIds: s.array('Array of show ids', s.string('Id of a show')),
        },
      }),
      exposeComponent(ShowForm, {
        description: 'Render a form to add a new TV show.',
      }),
      exposeComponent(ThemeSwitch, {
        description:
          'Render a theme switcher component when the user wants to change the theme.',
      }),
      exposeComponent(Markdown, {
        description: 'Render a markdown component to show rich text content.',
        input: {
          data: s.string('The markdown content to render'),
        },
      }),
    ],
  });

  sendMessage() {
    this.chat.sendMessage({
      role: 'user',
      content: this.chatModel().trim(),
    });
    this.chatModel.set('');
  }

  #scrollToUserMessage = effect(() => {
    const el = this.userMessageEls()?.at(-1)?.nativeElement;
    this.chat.isLoading();

    if (!el) {
      return;
    }

    el.scrollIntoView({ behavior: 'smooth' });
  });
}
