import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sp-loading-indicator',
  standalone: true,
  template: `
    <div class="wrap" aria-label="Loading..." role="status" aria-live="polite">
      <div class="loader">
        <svg
          viewBox="0 -8 160 178"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="bot"
        >
          <!-- base shadow -->
          <ellipse cx="80" cy="160" rx="36" ry="8" fill="#000" opacity=".22" />
          <!-- antenna -->
          <g class="antenna">
            <line
              x1="80"
              y1="18"
              x2="80"
              y2="4"
              stroke="var(--fg)"
              stroke-width="6"
              stroke-linecap="round"
            />
            <circle cx="80" cy="4" r="5" fill="var(--fg)" />
          </g>
          <!-- head -->
          <rect
            x="38"
            y="24"
            width="84"
            height="80"
            rx="20"
            fill="var(--face)"
            stroke="var(--ink)"
            stroke-width="8"
          />
          <!-- eyes with animated pupils -->
          <g transform="translate(60,64)">
            <circle r="10" fill="#fff" opacity=".9" />
            <circle class="pupil" r="5" fill="var(--fg)" />
            <rect
              class="lid"
              x="-12"
              y="-10"
              width="24"
              height="20"
              rx="6"
              fill="var(--face)"
              opacity=".95"
            />
          </g>
          <g transform="translate(100,64)">
            <circle r="10" fill="#fff" opacity=".9" />
            <circle class="pupil" r="5" fill="var(--fg)" />
            <rect
              class="lid"
              x="-12"
              y="-10"
              width="24"
              height="20"
              rx="6"
              fill="var(--face)"
              opacity=".95"
            />
          </g>
          <!-- subtle mouth track -->
          <rect
            x="60"
            y="106"
            width="40"
            height="8"
            rx="4"
            fill="var(--track)"
          />
        </svg>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --size: 96px;
      }

      :root,
      :host {
        /* Angular Material aware tokens */
        --md-primary: var(
          --md-sys-color-primary,
          var(--mdc-theme-primary, #1976d2)
        );

        /* Default (Dark Theme) Variables */
        --bg: var(--md-sys-color-surface, var(--mdc-theme-surface, #121620));
        --fg: var(--md-primary);
        --ink: #999999; /* Dark theme ink */
        --face: color-mix(
          in oklab,
          var(--md-sys-color-on-surface, #e6e6e6) 6%,
          transparent
        );
        --track: color-mix(
          in oklab,
          var(--md-sys-color-on-surface, #e6e6e6) 16%,
          transparent
        );
      }

      /* Light Theme Overrides */
      @media (prefers-color-scheme: light) {
        :host {
          --bg: var(--md-sys-color-surface, var(--mdc-theme-surface, #ffffff));
          --fg: var(
            --md-primary
          ); /* Primary color often stays the same or adjusts slightly */
          --ink: #666666; /* Lighter ink for light theme */
          --face: color-mix(
            in oklab,
            var(--md-sys-color-on-surface, #1c1b1f) 12%,
            transparent
          ); /* Darker face for light bg */
          --track: color-mix(
            in oklab,
            var(--md-sys-color-on-surface, #1c1b1f) 12%,
            transparent
          );
        }
      }

      .wrap {
        display: grid;
        place-items: center;
      }

      .loader {
        width: var(--size);
        height: calc(var(--size) * 1.05);
        position: relative;
      }

      svg {
        display: block;
        width: 100%;
        height: 100%;
        filter: drop-shadow(
          0 6px 20px color-mix(in oklab, #000 18%, transparent)
        );
      }

      /* Animations */
      @keyframes bob {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-2%);
        }
      }

      @keyframes eye-move {
        0%,
        100% {
          transform: translate(0, 0);
        }
        25% {
          transform: translate(2px, -1px);
        }
        50% {
          transform: translate(-2px, 1px);
        }
        75% {
          transform: translate(1px, 1px);
        }
      }

      @keyframes blink {
        0%,
        46%,
        48%,
        100% {
          transform: scaleY(1);
        }
        47% {
          transform: scaleY(0.1);
        }
      }

      .bot {
        animation: bob 2.4s ease-in-out infinite;
        transform-origin: 50% 50%;
      }

      .lid {
        transform-origin: center;
        animation: blink 5s linear infinite;
      }

      .pupil {
        animation: eye-move 3s ease-in-out infinite;
        transform-origin: 50% 50%;
      }

      .antenna {
        transform-origin: 50% 0%;
        animation: bob 2s ease-in-out infinite reverse;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .bot,
        .lid,
        .pupil,
        .antenna {
          animation: none !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--size.px]': 'size()',
  },
})
export class LoadingIndicator {
  size = input(96);
}
