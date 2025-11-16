import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatFabButton } from '@angular/material/button';
import {
  chatResource,
  createTool,
  exposeComponent,
  RenderMessageComponent,
  uiChatResource,
} from '@hashbrownai/angular';
import { MatCard, MatCardContent } from '@angular/material/card';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ShowsLoader } from '../../core/shows-loader';
import { Shows } from '../../pattern/shows/shows';
import { s } from '@hashbrownai/core';

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
  ],
  template: `
    <div class="chat-container">
      <div class="chat-input">
        <mat-form-field>
          <mat-label>How can I help you?</mat-label>
          <input
            #inputField
            matInput
            (keydown.enter)="sendMessage(inputField.value)"
          />
        </mat-form-field>

        <button
          matFab
          color="primary"
          class="send-button"
          aria-label="Send message"
          (click)="sendMessage(inputField.value)"
        >
          <mat-icon>send</mat-icon>
        </button>
      </div>

      <div class="chat-messages">
        @for (message of chat.value(); track $index) {
          @switch (message.role) {
            @case ('user') {
              <mat-card class="message user">
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
              }
            }
          }
        }
      </div>
    </div>
  `,
  styleUrl: './chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chat {
  #showsLoader = inject(ShowsLoader);

  chat = uiChatResource({
    model: 'gpt-4o',
    debugName: 'chat',
    system: `You are a friendly sarcastic chat bot`,
    tools: [
      createTool({
        name: 'getShows',
        description:
          'A tool to list available TV Shows. Call this tool whenever the user asks for shows',
        handler: () => {
          return lastValueFrom(this.#showsLoader.loadAll());
        },
      }),
    ],
    components: [
      exposeComponent(Shows, {
        description:
          'Render a component when the user asks to view one or more TV shows (e.g., "show X", "list shows", "details for show 123"). Never use for general questions.',
        input: {
          showIds: s.array('Array of show ids', s.string('Id of a show')),
        },
      }),
    ],
  });

  sendMessage(message: string) {
    this.chat.sendMessage({
      role: 'user',
      content: message.trim(),
    });
  }
}
