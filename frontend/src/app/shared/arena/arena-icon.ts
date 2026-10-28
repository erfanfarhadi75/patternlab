import { Component, Input } from '@angular/core';

/** Inline game icons for arena roles, modes, and HUD. */
@Component({
  selector: 'app-arena-icon',
  template: `
    <span class="ico" [attr.data-tone]="tone" [style.--s]="size" aria-hidden="true">
      @switch (name) {
        @case ('creator') {
          <svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="28" rx="6" fill="currentColor" opacity=".15"/><path d="M16 30V18h6a5 5 0 010 10h-3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="34" cy="16" r="4" fill="var(--accent-2)"/></svg>
        }
        @case ('concrete-creator') {
          <svg viewBox="0 0 48 48"><rect x="7" y="9" width="34" height="30" rx="7" fill="currentColor" opacity=".12"/><path d="M15 31V17h8a6 6 0 010 12h-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M28 14l8 8-8 8" fill="none" stroke="var(--accent-2)" stroke-width="2.6" stroke-linecap="round"/></svg>
        }
        @case ('product') {
          <svg viewBox="0 0 48 48"><rect x="12" y="12" width="24" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-dasharray="4 3"/><circle cx="24" cy="24" r="5" fill="var(--accent)"/></svg>
        }
        @case ('concrete-product') {
          <svg viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="6" fill="var(--accent)" opacity=".9"/><path d="M18 25l4 4 9-11" fill="none" stroke="#f4fffb" stroke-width="2.8" stroke-linecap="round"/></svg>
        }
        @case ('singleton') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="24" r="4" fill="currentColor" opacity=".45"/><path d="M24 8v4M24 36v4M8 24h4M36 24h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".5"/></svg>
        }
        @case ('target') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="24" r="8" fill="none" stroke="var(--accent-2)" stroke-width="2.4"/><circle cx="24" cy="24" r="3" fill="var(--accent)"/></svg>
        }
        @case ('adapter') {
          <svg viewBox="0 0 48 48"><rect x="6" y="16" width="16" height="16" rx="4" fill="var(--accent)"/><rect x="26" y="16" width="16" height="16" rx="4" fill="var(--accent-2)"/><rect x="18" y="20" width="12" height="8" rx="2" fill="currentColor" opacity=".25"/></svg>
        }
        @case ('adaptee') {
          <svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="20" rx="4" fill="currentColor" opacity=".14"/><path d="M16 24h16M20 20v8M28 20v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        }
        @case ('client') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="16" r="7" fill="var(--accent)"/><path d="M12 36c2-7 8-10 12-10s10 3 12 10" fill="currentColor" opacity=".18"/><path d="M12 36c2-7 8-10 12-10s10 3 12 10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        }
        @case ('facade') {
          <svg viewBox="0 0 48 48"><path d="M8 34V20l16-10 16 10v14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="20" y="26" width="8" height="8" fill="currentColor" opacity=".3"/></svg>
        }
        @case ('subject') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="8" fill="var(--accent)"/><path d="M24 8v4M24 36v4M8 24h4M36 24h4" stroke="var(--accent-2)" stroke-width="2.5" stroke-linecap="round"/></svg>
        }
        @case ('concrete-subject') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="10" fill="var(--accent)"/><circle cx="24" cy="24" r="16" fill="none" stroke="var(--accent-2)" stroke-width="2" opacity=".7"><animate attributeName="r" values="12;18;12" dur="1.6s" repeatCount="indefinite"/></circle></svg>
        }
        @case ('observer') {
          <svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="16" ry="10" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="24" r="4" fill="var(--accent)"/></svg>
        }
        @case ('observer-a') {
          <svg viewBox="0 0 48 48"><rect x="10" y="12" width="28" height="24" rx="5" fill="var(--accent)" opacity=".85"/><path d="M16 20h16M16 26h10" stroke="#f4fffb" stroke-width="2.4" stroke-linecap="round"/></svg>
        }
        @case ('observer-b') {
          <svg viewBox="0 0 48 48"><rect x="10" y="12" width="28" height="24" rx="5" fill="var(--accent-2)" opacity=".9"/><path d="M16 20h16M16 26h10" stroke="#fff7ed" stroke-width="2.4" stroke-linecap="round"/></svg>
        }
        @case ('mediator') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="6" fill="currentColor" opacity=".35"/><circle cx="10" cy="14" r="4" fill="currentColor" opacity=".5"/><circle cx="38" cy="14" r="4" fill="currentColor" opacity=".5"/><circle cx="10" cy="34" r="4" fill="currentColor" opacity=".5"/><circle cx="38" cy="34" r="4" fill="currentColor" opacity=".5"/><path d="M14 16l7 6M34 16l-7 6M14 32l7-6M34 32l-7-6" stroke="currentColor" stroke-width="1.8"/></svg>
        }
        @case ('blocks') {
          <svg viewBox="0 0 48 48"><rect x="8" y="8" width="14" height="14" rx="3" fill="var(--accent)"/><rect x="26" y="8" width="14" height="14" rx="3" fill="var(--accent-2)"/><rect x="8" y="26" width="14" height="14" rx="3" fill="var(--accent-2)"/><rect x="26" y="26" width="14" height="14" rx="3" fill="var(--accent)"/></svg>
        }
        @case ('code') {
          <svg viewBox="0 0 48 48"><path d="M18 14L10 24l8 10M30 14l8 10-8 10" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        }
        @case ('refactor') {
          <svg viewBox="0 0 48 48"><path d="M14 30c0-8 6-14 14-14h2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M26 10l6 6-6 6" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/><path d="M34 18c0 8-6 14-14 14h-2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M22 38l-6-6 6-6" fill="none" stroke="var(--accent-2)" stroke-width="2.6" stroke-linecap="round"/></svg>
        }
        @case ('quiz') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M20 20a4.5 4.5 0 115 4c-.8.6-1.5 1.2-1.5 2.5" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="32" r="1.8" fill="var(--accent-2)"/></svg>
        }
        @case ('extends') {
          <svg viewBox="0 0 48 48"><path d="M12 34V14h12" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M24 14l16 10-16 10V14z" fill="var(--accent)" opacity=".85"/></svg>
        }
        @case ('implements') {
          <svg viewBox="0 0 48 48"><rect x="8" y="14" width="14" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2"/><path d="M26 24h8" stroke="var(--accent-2)" stroke-width="2.6"/><rect x="34" y="14" width="10" height="20" rx="3" fill="var(--accent)"/></svg>
        }
        @case ('creates') {
          <svg viewBox="0 0 48 48"><circle cx="16" cy="24" r="8" fill="var(--accent)"/><path d="M26 24h8" stroke="var(--accent-2)" stroke-width="2.8" stroke-linecap="round"/><path d="M38 18v12M32 24h12" stroke="var(--accent-2)" stroke-width="2.8" stroke-linecap="round"/></svg>
        }
        @case ('wraps') {
          <svg viewBox="0 0 48 48"><rect x="16" y="16" width="16" height="16" rx="3" fill="var(--accent-2)"/><rect x="10" y="10" width="28" height="28" rx="6" fill="none" stroke="var(--accent)" stroke-width="2.6"/></svg>
        }
        @case ('notifies') {
          <svg viewBox="0 0 48 48"><circle cx="14" cy="24" r="6" fill="var(--accent)"/><path d="M22 24h6" stroke="currentColor" stroke-width="2.4"/><circle cx="36" cy="14" r="5" fill="var(--accent-2)"/><circle cx="36" cy="34" r="5" fill="var(--accent-2)"/><path d="M28 24l6-8M28 24l6 8" stroke="currentColor" stroke-width="2.2"/></svg>
        }
        @case ('uses') {
          <svg viewBox="0 0 48 48"><path d="M12 24h20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M28 16l10 8-10 8" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/></svg>
        }
        @case ('factory-method') {
          <svg viewBox="0 0 48 48"><rect x="6" y="12" width="18" height="24" rx="5" fill="var(--accent)"/><path d="M28 24h6" stroke="var(--accent-2)" stroke-width="2.6"/><rect x="34" y="16" width="10" height="16" rx="3" fill="var(--accent-2)"><animate attributeName="opacity" values=".5;1;.5" dur="1.4s" repeatCount="indefinite"/></rect></svg>
        }
        @case ('xp') {
          <svg viewBox="0 0 48 48"><polygon points="24,6 28,18 42,18 31,26 35,40 24,31 13,40 17,26 6,18 20,18" fill="var(--accent-2)"/></svg>
        }
        @case ('trophy') {
          <svg viewBox="0 0 48 48"><path d="M16 12h16v8a8 8 0 01-16 0V12z" fill="var(--accent-2)"/><path d="M16 14H10a6 6 0 006 8M32 14h6a6 6 0 01-6 8" fill="none" stroke="var(--accent)" stroke-width="2.4"/><path d="M22 28h4v6h-4z" fill="currentColor" opacity=".35"/><rect x="18" y="34" width="12" height="4" rx="1" fill="currentColor" opacity=".45"/></svg>
        }
        @case ('play') {
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="var(--accent)" opacity=".2"/><path d="M20 16l14 8-14 8V16z" fill="var(--accent)"/></svg>
        }
        @default {
          <svg viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="8" fill="currentColor" opacity=".2"/></svg>
        }
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
      .ico {
        width: var(--s, 1.6rem);
        height: var(--s, 1.6rem);
        display: inline-flex;
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
