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
import { ArenaIcon } from '../../shared/arena/arena-icon';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TranslatePipe, LocalizePipe, ArenaIcon],
  template: `
    <section class="hero">
      <div class="brand-row">
        <img src="/assets/arena/forge-create.svg" width="88" height="58" alt="" class="hero-art" />
        <p class="eyebrow">{{ 'brand' | t }}</p>
      </div>
      <h1>{{ 'dashboard.greeting' | t }}</h1>
      <p class="lede">{{ 'dashboard.subtitle' | t }}</p>
      <div class="cta-row">
        <a class="btn primary play" routerLink="/practice" [queryParams]="playQuery()">
          <app-arena-icon name="play" size="1.15rem" />
          {{ 'cta.play' | t }}
        </a>
        <a class="btn ghost" [routerLink]="nextLink()">{{ 'cta.continue' | t }}</a>
        <a class="btn ghost" routerLink="/explorer">{{ 'cta.explore' | t }}</a>
      </div>
      <div class="stats" aria-label="Progress snapshot">
        <div class="stat">
          <img src="/assets/arena/xp-spin.svg" width="28" height="28" alt="" />
          <div>
            <span class="label">{{ 'dashboard.statsXp' | t }}</span>
            <strong>{{ progress.progress()?.xp ?? 0 }}</strong>
          </div>
        </div>
        <div class="stat">
          <app-arena-icon name="trophy" size="1.6rem" tone="amber" />
          <div>
            <span class="label">{{ 'dashboard.statsLevel' | t }}</span>
            <strong>{{ progress.progress()?.level ?? 1 }}</strong>
          </div>
        </div>
        <div class="stat">
          <img src="/assets/arena/spark.gif.svg" width="28" height="28" alt="" />
          <div>
            <span class="label">{{ 'dashboard.statsStreak' | t }}</span>
            <strong>{{ progress.progress()?.streakDays ?? 0 }}</strong>
          </div>
        </div>
      </div>
      <div class="art-strip" aria-hidden="true">
        <img src="/assets/arena/forge-create.svg" alt="" />
        <img src="/assets/arena/plug-adapter.svg" alt="" />
        <img src="/assets/arena/notify-pulse.svg" alt="" />
        <img src="/assets/arena/win-burst.svg" alt="" />
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
          <img class="next-art" src="/assets/arena/tile-glow.svg" alt="" />
          <app-arena-icon [name]="p.id" size="2.4rem" />
          <div>
            <span class="cat">{{ ('filter.' + p.categoryId) | t }}</span>
            <strong>{{ p.name | loc }}</strong>
            <span>{{ p.tagline | loc }}</span>
          </div>
          <app-arena-icon name="play" size="1.4rem" tone="accent" />
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
      .brand-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .hero-art {
        flex-shrink: 0;
        filter: drop-shadow(0 8px 18px color-mix(in oklab, var(--accent) 25%, transparent));
        animation: floaty 2.8s ease-in-out infinite;
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
      .play {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
      @keyframes floaty {
        50% {
          transform: translateY(-5px);
        }
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
        grid-template-columns: repeat(3, minmax(0, 10rem));
        gap: 0.85rem;
      }
      .stat {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.55rem 0.7rem;
        border-radius: 0.9rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 88%, transparent);
      }
      .stats .label {
        display: block;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
      }
      .stats strong {
        font-family: var(--font-mono);
        font-size: 1.25rem;
      }
      .art-strip {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.4rem;
        flex-wrap: wrap;
      }
      .art-strip img {
        height: 56px;
        width: auto;
        filter: drop-shadow(0 8px 16px color-mix(in oklab, var(--accent) 18%, transparent));
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
        position: relative;
        display: grid;
        grid-template-columns: auto auto 1fr auto;
        gap: 0.85rem;
        align-items: center;
        text-decoration: none;
        color: inherit;
        padding: 1rem 1.1rem;
        border: 1px solid var(--line);
        border-radius: 1.1rem;
        overflow: hidden;
        background: var(--surface);
        transition: transform 200ms ease;
      }
      .next-card:hover {
        transform: translateY(-3px);
      }
      .next-art {
        position: absolute;
        inset-inline-end: -10px;
        top: -20px;
        width: 120px;
        opacity: 0.55;
        pointer-events: none;
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
