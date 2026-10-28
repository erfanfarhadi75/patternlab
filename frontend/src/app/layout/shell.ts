import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../core/pipes/translate.pipe';
import { I18nService } from '../core/services/i18n.service';
import { ProgressStoreService } from '../core/services/progress-store.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="shell" [attr.dir]="i18n.dir()">
      <header class="top">
        <a routerLink="/" class="brand">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__name">{{ 'brand' | t }}</span>
        </a>
        <nav class="nav" aria-label="Primary">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{
            'nav.dashboard' | t
          }}</a>
          <a routerLink="/explorer" routerLinkActive="active">{{ 'nav.explorer' | t }}</a>
          <a routerLink="/practice" routerLinkActive="active">{{ 'nav.practice' | t }}</a>
          <a routerLink="/progress" routerLinkActive="active">{{ 'nav.progress' | t }}</a>
          <a routerLink="/settings" routerLinkActive="active">{{ 'nav.settings' | t }}</a>
        </nav>
        <div class="chip" title="XP">
          <span>{{ progress.progress()?.xp ?? 0 }} XP</span>
          <span class="sep">·</span>
          <span>Lv {{ progress.progress()?.level ?? 1 }}</span>
        </div>
      </header>
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
      }
      .top {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.85rem clamp(1rem, 3vw, 2rem);
        backdrop-filter: blur(14px);
        background: color-mix(in oklab, var(--bg) 78%, transparent);
        border-bottom: 1px solid var(--line);
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        text-decoration: none;
        color: inherit;
      }
      .brand__mark {
        width: 0.85rem;
        height: 0.85rem;
        border-radius: 0.2rem;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent);
      }
      .brand__name {
        font-family: var(--font-display);
        font-weight: 650;
        letter-spacing: -0.02em;
        font-size: 1.15rem;
      }
      .nav {
        display: flex;
        gap: 0.35rem;
        flex-wrap: wrap;
        margin-inline-start: 0.5rem;
      }
      .nav a {
        text-decoration: none;
        color: var(--muted);
        padding: 0.4rem 0.7rem;
        border-radius: 999px;
        font-size: 0.92rem;
      }
      .nav a.active,
      .nav a:hover {
        color: var(--ink);
        background: color-mix(in oklab, var(--surface) 70%, transparent);
      }
      .chip {
        margin-inline-start: auto;
        font-family: var(--font-mono);
        font-size: 0.8rem;
        padding: 0.35rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 999px;
        color: var(--muted);
        white-space: nowrap;
      }
      .sep {
        margin: 0 0.25rem;
      }
      .main {
        padding: clamp(1.25rem, 3vw, 2.5rem);
        max-width: 1180px;
        margin: 0 auto;
      }
      @media (max-width: 820px) {
        .top {
          flex-wrap: wrap;
        }
        .chip {
          margin-inline-start: 0;
        }
      }
    `,
  ],
})
export class Shell {
  readonly i18n = inject(I18nService);
  readonly progress = inject(ProgressStoreService);
}
