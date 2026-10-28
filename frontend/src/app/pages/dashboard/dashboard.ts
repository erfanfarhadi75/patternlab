import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PatternSummaryDto } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TranslatePipe, LocalizePipe],
  template: `
    <section class="hero">
      <p class="eyebrow">{{ 'brand' | t }}</p>
      <h1>{{ 'dashboard.greeting' | t }}</h1>
      <p class="lede">{{ 'dashboard.subtitle' | t }}</p>
      <div class="cta-row">
        <a class="btn primary" routerLink="/practice" [queryParams]="playQuery()">{{ 'cta.play' | t }}</a>
        <a class="btn ghost" [routerLink]="nextLink()">{{ 'cta.continue' | t }}</a>
        <a class="btn ghost" routerLink="/explorer">{{ 'cta.explore' | t }}</a>
      </div>
      <div class="stats" aria-label="Progress snapshot">
        <div>
          <span class="label">{{ 'dashboard.statsXp' | t }}</span>
          <strong>{{ progress.progress()?.xp ?? 0 }}</strong>
        </div>
        <div>
          <span class="label">{{ 'dashboard.statsLevel' | t }}</span>
          <strong>{{ progress.progress()?.level ?? 1 }}</strong>
        </div>
        <div>
          <span class="label">{{ 'dashboard.statsStreak' | t }}</span>
          <strong>{{ progress.progress()?.streakDays ?? 0 }}</strong>
        </div>
      </div>
    </section>

    <section class="next">
      <h2>{{ 'dashboard.nextStep' | t }}</h2>
      <p class="play-hint">{{ 'dashboard.playHint' | t }}</p>
      @if (loading()) {
        <p class="muted">{{ 'loading' | t }}</p>
      } @else if (error()) {
        <p class="error">{{ 'dashboard.empty' | t }}</p>
      } @else if (nextPattern(); as p) {
        <a class="next-card" routerLink="/practice" [queryParams]="playQuery()">
          <span class="cat">{{ ('filter.' + p.categoryId) | t }} · {{ 'nav.practice' | t }}</span>
          <strong>{{ p.name | loc }}</strong>
          <span>{{ p.tagline | loc }}</span>
        </a>
      }
    </section>
  `,
  styles: [
    `
      .hero {
        position: relative;
        padding: clamp(1.5rem, 4vw, 3rem) 0 2rem;
        animation: rise 700ms ease both;
      }
      .eyebrow {
        font-family: var(--font-display);
        font-size: clamp(2.4rem, 6vw, 4.2rem);
        font-weight: 700;
        letter-spacing: -0.04em;
        margin: 0;
        background: linear-gradient(120deg, var(--ink), var(--accent));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        line-height: 1.05;
      }
      h1 {
        margin: 0.35rem 0 0.75rem;
        font-size: clamp(1.35rem, 2.4vw, 1.8rem);
        font-weight: 550;
        color: var(--muted);
      }
      .lede {
        max-width: 36rem;
        color: var(--muted);
        margin: 0 0 1.4rem;
        line-height: 1.55;
      }
      .cta-row {
        display: flex;
        gap: 0.7rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 8rem));
        gap: 1rem;
      }
      .stats .label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
      }
      .stats strong {
        font-family: var(--font-mono);
        font-size: 1.35rem;
      }
      .next {
        margin-top: 2rem;
        animation: rise 900ms ease both;
      }
      .next h2 {
        font-family: var(--font-display);
        font-size: 1.2rem;
        margin-bottom: 0.35rem;
      }
      .play-hint {
        color: var(--muted);
        margin: 0 0 0.9rem;
        max-width: 36rem;
      }
      .next-card {
        display: grid;
        gap: 0.35rem;
        text-decoration: none;
        color: inherit;
        padding: 1.1rem 0;
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        transition: transform 200ms ease;
      }
      .next-card:hover {
        transform: translateY(-2px);
      }
      .cat {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent);
      }
      .muted,
      .error {
        color: var(--muted);
      }
    `,
  ],
})
export class DashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly settings = inject(SettingsService);
  readonly progress = inject(ProgressStoreService);
  readonly i18n = inject(I18nService);

  readonly patterns = signal<PatternSummaryDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly nextPattern = computed(() => {
    const level = this.settings.settings().level;
    const list = this.patterns();
    const incomplete = list.find((p) => !this.progress.isLessonComplete(p.id, level));
    return incomplete ?? list[0] ?? null;
  });

  nextLink(): string[] {
    const p = this.nextPattern();
    return p ? ['/patterns', p.id] : ['/explorer'];
  }

  playQuery(): { pattern: string; mode: string } {
    const p = this.nextPattern();
    return { pattern: p?.id ?? 'factory-method', mode: 'blocks' };
  }

  async ngOnInit(): Promise<void> {
    await this.progress.refresh();
    try {
      const catalog = await firstValueFrom(this.api.getCatalog());
      this.patterns.set(catalog.patterns);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
