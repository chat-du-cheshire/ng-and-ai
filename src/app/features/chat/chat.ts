import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-chat',
    imports: [],
    template: `<h1>Chat</h1>`,
    styleUrl: './chat.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chat {}
