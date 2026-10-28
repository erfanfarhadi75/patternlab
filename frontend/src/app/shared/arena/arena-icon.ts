import { Component, Input } from '@angular/core';

/**
 * Precise pattern-role glyphs. Shared 48×48 viewBox + 6px padding
 * keeps kit tiles and canvas blocks optically aligned.
 */
@Component({
  selector: 'app-arena-icon',
  template: `
    <span class="ico" [attr.data-tone]="tone" [style.--s]="size" aria-hidden="true">
      @switch (name) {
        @case ('creator') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="8"
              y="10"
              width="32"
              height="28"
              rx="4"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="3.5 2.5"
            />
            <path d="M16 20h16M16 28h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="34" cy="28" r="5" fill="var(--accent-2)" />
            <path d="M34 25.5v5M31.5 28h5" stroke="#fff7ed" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        }
        @case ('concrete-creator') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="8"
              y="10"
              width="32"
              height="28"
              rx="4"
              fill="var(--accent)"
              fill-opacity=".18"
              stroke="var(--accent)"
              stroke-width="2"
            />
            <path d="M16 20h16M16 28h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="34" cy="28" r="5" fill="var(--accent-2)" />
            <path d="M34 25.5v5M31.5 28h5" stroke="#fff7ed" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        }
        @case ('product') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="12"
              y="12"
              width="24"
              height="24"
              rx="4"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="3.5 2.5"
            />
            <circle cx="24" cy="24" r="4" stroke="var(--accent)" stroke-width="2" />
          </svg>
        }
        @case ('concrete-product') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="12" y="12" width="24" height="24" rx="4" fill="var(--accent)" stroke="var(--accent)" stroke-width="2" />
            <circle cx="24" cy="24" r="4" fill="#f4fffb" />
          </svg>
        }
        @case ('singleton') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="12" stroke="currentColor" stroke-width="2" />
            <circle cx="24" cy="24" r="3.5" fill="currentColor" />
            <path
              d="M24 8v4M24 36v4M8 24h4M36 24h4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              opacity=".45"
            />
          </svg>
        }
        @case ('target') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="10"
              y="14"
              width="20"
              height="20"
              rx="3"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="3.5 2.5"
            />
            <path d="M30 24h6" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
            <circle cx="38" cy="24" r="4" stroke="var(--accent)" stroke-width="2" />
          </svg>
        }
        @case ('adapter') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="7" y="16" width="14" height="16" rx="3" fill="var(--accent)" />
            <rect x="27" y="16" width="14" height="16" rx="3" fill="var(--accent-2)" />
            <rect x="19" y="21" width="10" height="6" rx="1.5" fill="currentColor" fill-opacity=".28" />
            <path d="M21 24h6" stroke="#f4fffb" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        }
        @case ('adaptee') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="10" y="14" width="28" height="20" rx="3" stroke="currentColor" stroke-width="2" />
            <path d="M16 21h16M16 27h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55" />
            <path
              d="M34 12l2 2-2 2"
              stroke="var(--accent-2)"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        @case ('client') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="17" r="6" fill="var(--accent)" />
            <path d="M14 35c1.5-6 5.5-9 10-9s8.5 3 10 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        }
        @case ('facade') {
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M10 34V22L24 12l14 10v12" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <rect x="21" y="26" width="6" height="8" fill="currentColor" fill-opacity=".35" />
          </svg>
        }
        @case ('subject') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="7" fill="var(--accent)" />
            <path
              d="M24 9v5M24 34v5M9 24h5M34 24h5M13 13l3.5 3.5M31.5 31.5L35 35M35 13l-3.5 3.5M13 35l3.5-3.5"
              stroke="var(--accent-2)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        }
        @case ('concrete-subject') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="9" fill="var(--accent)" />
            <circle cx="24" cy="24" r="14" stroke="var(--accent-2)" stroke-width="2" stroke-opacity=".85" />
            <circle cx="24" cy="24" r="3" fill="#f4fffb" />
          </svg>
        }
        @case ('observer') {
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M8 24c4-8 10-12 16-12s12 4 16 12c-4 8-10 12-16 12S12 32 8 24z"
              stroke="currentColor"
              stroke-width="2"
            />
            <circle cx="24" cy="24" r="4.5" fill="var(--accent)" />
          </svg>
        }
        @case ('observer-a') {
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M8 24c4-8 10-12 16-12s12 4 16 12c-4 8-10 12-16 12S12 32 8 24z"
              stroke="var(--accent)"
              stroke-width="2"
            />
            <circle cx="24" cy="24" r="4.5" fill="var(--accent)" />
            <circle cx="36" cy="14" r="7" fill="var(--accent)" />
            <path d="M33.2 14h5.6M36 11.2v5.6" stroke="#f4fffb" stroke-width="1.7" stroke-linecap="round" />
          </svg>
        }
        @case ('observer-b') {
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M8 24c4-8 10-12 16-12s12 4 16 12c-4 8-10 12-16 12S12 32 8 24z"
              stroke="var(--accent-2)"
              stroke-width="2"
            />
            <circle cx="24" cy="24" r="4.5" fill="var(--accent-2)" />
            <circle cx="36" cy="14" r="7" fill="var(--accent-2)" />
            <path d="M33.2 14h5.6" stroke="#fff7ed" stroke-width="1.7" stroke-linecap="round" />
          </svg>
        }
        @case ('mediator') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="5" fill="currentColor" fill-opacity=".4" />
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.8" />
            <circle cx="36" cy="12" r="3.5" stroke="currentColor" stroke-width="1.8" />
            <circle cx="12" cy="36" r="3.5" stroke="currentColor" stroke-width="1.8" />
            <circle cx="36" cy="36" r="3.5" stroke="currentColor" stroke-width="1.8" />
            <path d="M15 14l6 7M33 14l-6 7M15 34l6-7M33 34l-6-7" stroke="currentColor" stroke-width="1.6" />
          </svg>
        }
        @case ('blocks') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2.5" fill="var(--accent)" />
            <rect x="26" y="9" width="13" height="13" rx="2.5" fill="var(--accent-2)" />
            <rect x="9" y="26" width="13" height="13" rx="2.5" fill="var(--accent-2)" />
            <rect x="26" y="26" width="13" height="13" rx="2.5" fill="var(--accent)" />
          </svg>
        }
        @case ('code') {
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M18 14L10 24l8 10M30 14l8 10-8 10"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        @case ('refactor') {
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M15 30a10 10 0 0110-10h2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <path
              d="M25 14l6 6-6 6"
              stroke="var(--accent)"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M33 18a10 10 0 01-10 10h-2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <path
              d="M23 34l-6-6 6-6"
              stroke="var(--accent-2)"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        @case ('quiz') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="13" stroke="currentColor" stroke-width="2" />
            <path
              d="M20 19.5a4.2 4.2 0 114.4 4.1c-.9.5-1.4 1.2-1.4 2.4"
              stroke="var(--accent)"
              stroke-width="2.2"
              stroke-linecap="round"
            />
            <circle cx="24" cy="32" r="1.7" fill="var(--accent-2)" />
          </svg>
        }
        @case ('extends') {
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M12 34V16h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M22 16l14 9-14 9V16z" fill="var(--accent)" />
          </svg>
        }
        @case ('implements') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="9"
              y="14"
              width="12"
              height="20"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="3 2"
            />
            <path d="M24 24h7" stroke="var(--accent-2)" stroke-width="2" stroke-linecap="round" />
            <rect x="31" y="14" width="10" height="20" rx="2" fill="var(--accent)" />
          </svg>
        }
        @case ('creates') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="15" cy="24" r="7" fill="var(--accent)" />
            <path d="M24 24h7" stroke="var(--accent-2)" stroke-width="2.2" stroke-linecap="round" />
            <path d="M35 18v12M29 24h12" stroke="var(--accent-2)" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        }
        @case ('wraps') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="17" y="17" width="14" height="14" rx="2.5" fill="var(--accent-2)" />
            <rect x="11" y="11" width="26" height="26" rx="5" stroke="var(--accent)" stroke-width="2" />
          </svg>
        }
        @case ('notifies') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="14" cy="24" r="5.5" fill="var(--accent)" />
            <path d="M21 24h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M26 24l7-8M26 24l7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="35" cy="14" r="4" fill="var(--accent-2)" />
            <circle cx="35" cy="34" r="4" fill="var(--accent-2)" />
          </svg>
        }
        @case ('uses') {
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M11 24h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <path
              d="M26 16l11 8-11 8"
              stroke="var(--accent)"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        @case ('factory-method') {
          <svg viewBox="0 0 48 48" fill="none">
            <rect
              x="8"
              y="12"
              width="16"
              height="24"
              rx="3"
              fill="var(--accent)"
              fill-opacity=".2"
              stroke="var(--accent)"
              stroke-width="2"
            />
            <path d="M26 24h6" stroke="var(--accent-2)" stroke-width="2" stroke-linecap="round" />
            <rect x="32" y="16" width="10" height="16" rx="2.5" fill="var(--accent-2)" />
          </svg>
        }
        @case ('xp') {
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M24 8l3.2 9.8H38l-8.4 6.1 3.2 9.8L24 27.6 15.2 33.7l3.2-9.8L10 17.8h10.8L24 8z"
              fill="var(--accent-2)"
            />
          </svg>
        }
        @case ('trophy') {
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M17 12h14v7a7 7 0 01-14 0v-7z" fill="var(--accent-2)" />
            <path d="M17 14h-5a5 5 0 005 7M31 14h5a5 5 0 01-5 7" stroke="var(--accent)" stroke-width="2" />
            <path d="M22 26h4v5h-4z" fill="currentColor" fill-opacity=".35" />
            <rect x="19" y="31" width="10" height="3.5" rx="1" fill="currentColor" fill-opacity=".45" />
          </svg>
        }
        @case ('play') {
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="14" fill="var(--accent)" fill-opacity=".18" />
            <path d="M20 16.5l13 7.5-13 7.5V16.5z" fill="var(--accent)" />
          </svg>
        }
        @default {
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="12" y="12" width="24" height="24" rx="6" stroke="currentColor" stroke-width="2" stroke-opacity=".35" />
          </svg>
        }
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
        line-height: 0;
        vertical-align: middle;
      }
      .ico {
        width: var(--s, 1.6rem);
        height: var(--s, 1.6rem);
        display: grid;
        place-items: center;
        color: var(--ink);
      }
      .ico[data-tone='accent'] {
        color: var(--accent);
      }
      .ico[data-tone='amber'] {
        color: var(--accent-2);
      }
      .ico[data-tone='muted'] {
        color: var(--muted);
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class ArenaIcon {
  @Input({ required: true }) name!: string;
  @Input() size = '1.6rem';
  @Input() tone: 'ink' | 'accent' | 'amber' | 'muted' = 'ink';
}
