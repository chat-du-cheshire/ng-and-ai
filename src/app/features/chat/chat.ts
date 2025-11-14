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
import { chatResource, createTool } from '@hashbrownai/angular';
import { MatCard, MatCardContent } from '@angular/material/card';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ShowsLoader } from '../../core/shows-loader';

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
                    <p>{{ message.content }}</p>
                  </mat-card-content>
                </mat-card>
              </div>
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

  chat = chatResource({
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
  });

  #effectRef = effect(() => {
    console.log(this.chat.value());
  });

  sendMessage(message: string) {
    this.chat.sendMessage({
      role: 'user',
      content: message.trim(),
    });
  }
}
