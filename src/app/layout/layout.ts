import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer';

@Component({
    selector: 'app-layout',
    template: `
        <div class="app-container">
            <div class="content-container">
                <router-outlet />
            </div>
            <app-footer />
        </div>
    `,
    imports: [RouterOutlet, Footer],
    styleUrl: './layout.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {}
