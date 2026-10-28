import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ArenaMode, PatternDetailDto, PatternSummaryDto } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { QuizPanel } from '../../shared/quiz-panel';
import { BlockCanvas } from '../../shared/arena/block-canvas';
import { CodeMode } from '../../shared/arena/code-mode';
import { RefactorMode } from '../../shared/arena/refactor-mode';
import { ArenaIcon } from '../../shared/arena/arena-icon';
import {
  ARENA_PATTERN_IDS,
  BLOCK_CHALLENGES,
  CODE_CHALLENGES,
  PATTERN_ART,
  REFACTOR_CHALLENGES,
} from '../../shared/arena/arena-data';

@Component({
  selector: 'app-practice',
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    LocalizePipe,
    QuizPanel,
    BlockCanvas,
    CodeMode,
    RefactorMode,
    ArenaIcon,
  ],
  template: `
    <header class="hud">
      <div class="hud__art">
        <img class="hud__banner" [src]="bannerArt()" alt="" width="140" height="92" />
        <img class="hud__spark" src="/assets/arena/spark.gif.svg" alt="" width="48" height="48" />
      </div>
      <div class="hud__text">
        <p class="eyebrow">
          <app-arena-icon name="play" size="1rem" />
          {{ 'arena.eyebrow' | t }}
        </p>
        <h1>{{ 'practice.title' | t }}</h1>
        <p class="sub">{{ 'practice.subtitle' | t }}</p>
      </div>
      <div class="hud__xp" dir="ltr">
        <img src="/assets/arena/xp-spin.svg" width="32" height="32" alt="" />
        <div>
          <strong>{{ progress.progress()?.xp ?? 0 }}</strong>
          <span>XP</span>
        </div>
      </div>
    </header>

    <div class="controls">
      <label class="picker">
        <span>{{ 'practice.pick' | t }}</span>
        <select [ngModel]="selectedId()" (ngModelChange)="select($event)">
          @for (p of summaries(); track p.id) {
            <option [value]="p.id">{{ p.name | loc }}</option>
          }
        </select>
      </label>

      <div class="modes" role="tablist">
        @for (m of modes; track m) {
          <button
            type="button"
            role="tab"
            [class.active]="mode() === m"
            [attr.aria-selected]="mode() === m"
            (click)="setMode(m)"
          >
            <app-arena-icon [name]="m" size="1.15rem" />
            {{ ('arena.mode.' + m) | t }}
            @if (m !== 'quiz' && cleared(m)) {
              <app-arena-icon name="trophy" size="0.9rem" tone="amber" />
            }
          </button>
        }
      </div>
    </div>

    @if (loading()) {
      <p class="muted">{{ 'loading' | t }}</p>
    } @else if (!detail()) {
      <p class="muted">{{ 'practice.empty' | t }}</p>
    } @else {
      <div class="stage-label">
        <app-arena-icon [name]="selectedId()" size="1.35rem" />
        <span>{{ detail()!.name | loc }}</span>
        <span class="pill">{{ ('level.' + level()) | t }}</span>
      </div>

      @switch (mode()) {
        @case ('blocks') {
          @if (blockChallenge(); as ch) {
            <app-block-canvas [challenge]="ch" (cleared)="onArenaResult('blocks', $event)" />
          }
        }
        @case ('code') {
          @if (codeChallenge(); as ch) {
            <app-code-mode [challenge]="ch" (cleared)="onArenaResult('code', $event)" />
          }
        }
        @case ('refactor') {
          @if (refactorChallenge(); as ch) {
            <app-refactor-mode [challenge]="ch" (cleared)="onArenaResult('refactor', $event)" />
          }
        }
        @case ('quiz') {
          @for (q of exercises(); track q.id) {
            <app-quiz-panel
              [patternId]="detail()!.id"
              [question]="q"
              [locked]="!!q.requiresUnlock && !progress.hasUnlock('advanced-observer')"
            />
          }
          @if (!exercises().length) {
            <p class="muted">{{ 'practice.empty' | t }}</p>
          }
        }
      }

      @if (toast()) {
        <div class="toast" role="status">
          <img src="/assets/arena/xp-spin.svg" width="24" height="24" alt="" />
          {{ toast() }}
        </div>
      }

      <p class="learn-link">
        <a [routerLink]="['/patterns', selectedId()]">
          <app-arena-icon name="quiz" size="1rem" />
          {{ 'arena.backToLearn' | t }}
        </a>
      </p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 1120px;
      }
      .hud {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
        align-items: center;
        padding: 0.95rem 1.1rem;
        border-radius: 1.2rem;
        border: 1px solid var(--line);
        background:
          radial-gradient(600px 180px at 10% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent),
          radial-gradient(420px 160px at 100% 0%, color-mix(in oklab, var(--accent-2) 16%, transparent), transparent),
          var(--surface);
        margin-bottom: 1.1rem;
        animation: rise 500ms ease both;
      }
      .hud__art {
        position: relative;
        width: 140px;
        height: 92px;
      }
      .hud__banner {
        filter: drop-shadow(0 10px 18px color-mix(in oklab, var(--accent) 22%, transparent));
      }
      .hud__spark {
        position: absolute;
        inset-inline-end: -8px;
        top: -8px;
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }
      h1 {
        font-family: var(--font-display);
        font-size: clamp(1.7rem, 3.5vw, 2.3rem);
        margin: 0.15rem 0;
        letter-spacing: -0.03em;
      }
      .sub {
        margin: 0;
        color: var(--muted);
        max-width: 28rem;
        font-size: 0.95rem;
      }
      .hud__xp {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.45rem 0.75rem;
        border-radius: 1rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--accent-2) 12%, transparent);
      }
      .hud__xp strong {
        display: block;
        font-family: var(--font-mono);
        font-size: 1.15rem;
        line-height: 1;
      }
      .hud__xp span {
        font-size: 0.7rem;
        color: var(--muted);
        letter-spacing: 0.06em;
      }
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 1.4rem;
        align-items: end;
        margin-bottom: 0.85rem;
      }
      .picker {
        display: grid;
        gap: 0.3rem;
        min-width: 13rem;
        font-size: 0.85rem;
        color: var(--muted);
      }
      select {
        padding: 0.65rem 0.75rem;
        border-radius: 0.75rem;
        border: 1px solid var(--line);
        background: var(--surface);
        color: inherit;
      }
      .modes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }
      .modes button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.5rem 0.85rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        font: inherit;
        font-size: 0.88rem;
        line-height: 1;
      }
      .modes button app-arena-icon {
        flex-shrink: 0;
      }
      .modes button.active {
        color: var(--ink);
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 14%, transparent);
        box-shadow: 0 6px 16px color-mix(in oklab, var(--accent) 16%, transparent);
      }
      .stage-label {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin-bottom: 0.85rem;
        font-family: var(--font-mono);
        font-size: 0.88rem;
      }
      .pill {
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        color: var(--accent);
        font-size: 0.75rem;
      }
      .toast {
        position: sticky;
        bottom: 1rem;
        margin-top: 1rem;
        padding: 0.7rem 1rem;
        border-radius: 0.85rem;
        background: color-mix(in oklab, var(--accent) 16%, var(--surface));
        border: 1px solid color-mix(in oklab, var(--accent) 40%, var(--line));
        animation: rise 350ms ease both;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .learn-link {
        margin-top: 1.4rem;
      }
      .learn-link a {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--accent);
        text-decoration: none;
      }
      @media (max-width: 720px) {
        .hud {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PracticePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly settings = inject(SettingsService);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly progress = inject(ProgressStoreService);

  readonly modes: ArenaMode[] = ['blocks', 'code', 'refactor', 'quiz'];
  readonly summaries = signal<PatternSummaryDto[]>([]);
  readonly selectedId = signal('factory-method');
  readonly detail = signal<PatternDetailDto | null>(null);
  readonly loading = signal(true);
  readonly mode = signal<ArenaMode>('blocks');
  readonly toast = signal('');
  readonly level = computed(() => this.settings.settings().level);

  readonly exercises = computed(() => {
    const d = this.detail();
    if (!d) return [];
    return d.exercises.filter((e) => e.level === this.level());
  });

  readonly blockChallenge = computed(() => BLOCK_CHALLENGES[this.selectedId()] ?? null);
  readonly codeChallenge = computed(() => CODE_CHALLENGES[this.selectedId()] ?? null);
  readonly refactorChallenge = computed(() => REFACTOR_CHALLENGES[this.selectedId()] ?? null);

  bannerArt(): string {
    return PATTERN_ART[this.selectedId()] ?? '/assets/arena/spark.gif.svg';
  }

  async ngOnInit(): Promise<void> {
    await this.progress.refresh();
    const catalog = await firstValueFrom(this.api.getCatalog());
    const playable = catalog.patterns.filter((p) =>
      (ARENA_PATTERN_IDS as readonly string[]).includes(p.id)
    );
    this.summaries.set(playable.length ? playable : catalog.patterns);

    const qPattern = this.route.snapshot.queryParamMap.get('pattern');
    const qMode = this.route.snapshot.queryParamMap.get('mode') as ArenaMode | null;
    const initial =
      qPattern && this.summaries().some((p) => p.id === qPattern)
        ? qPattern
        : (this.summaries()[0]?.id ?? 'factory-method');

    if (qMode && this.modes.includes(qMode)) this.mode.set(qMode);
    this.selectedId.set(initial);
    await this.select(initial);
  }

  async select(id: string): Promise<void> {
    this.selectedId.set(id);
    this.loading.set(true);
    this.toast.set('');
    try {
      const detail = await firstValueFrom(this.api.getPattern(id));
      this.detail.set(detail);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { pattern: id, mode: this.mode() },
        replaceUrl: true,
      });
    } catch {
      this.detail.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  setMode(mode: ArenaMode): void {
    this.mode.set(mode);
    this.toast.set('');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pattern: this.selectedId(), mode },
      replaceUrl: true,
    });
  }

  cleared(mode: ArenaMode): boolean {
    if (mode === 'quiz') return false;
    return this.progress.isArenaComplete(this.selectedId(), mode);
  }

  async onArenaResult(
    challengeId: 'blocks' | 'code' | 'refactor',
    result: { score: number; passed: boolean }
  ): Promise<void> {
    try {
      const response = await this.progress.completeArena(
        this.selectedId(),
        challengeId,
        challengeId,
        result.passed,
        result.score
      );
      this.toast.set(this.i18n.localize(response.feedback));
    } catch {
      this.toast.set(this.i18n.t('arena.submitError'));
    }
  }
}
