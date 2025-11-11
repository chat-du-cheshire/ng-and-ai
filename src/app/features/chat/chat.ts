import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatFabButton } from '@angular/material/button';
import { chatResource } from '@hashbrownai/angular';

@Component({
    selector: 'app-chat',
    imports: [
        MatFormField,
        MatLabel,
        MatInput,
        MatFabButton,
        MatIcon,
        MatLabel,
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
        </div>
    `,
    styleUrl: './chat.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chat {
    chat = chatResource({
        model: 'gpt-4o',
        system: `You are a friendly sarcastic chat bot`,
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
