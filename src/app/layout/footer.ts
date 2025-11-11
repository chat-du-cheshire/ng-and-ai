import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
        <footer class="footer">
            <div class="footer-content">
                <p>chat-du-cheshire</p>
            </div>
        </footer>
    `,
    styleUrl: './footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
