import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ArenaMode, PatternSummaryDto } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { QuizPanel } from '../../shared/quiz-panel';
import { BlockCanvas } from '../../shared/arena/block-canvas';
import { CodeMode } from '../../shared/arena/code-mode';
import { RefactorMode } from '../../shared/arena/refactor-mode';
import {
  ARENA_PATTERN_IDS,
  BLOCK_CHALLENGES,
  CODE_CHALLENGES,
  REFACTOR_CHALLENGES,
} from '../../shared/arena/arena-data';
import { PatternDetailDto } from '../../core/models/models';
import { SettingsService } from '../../core/services/settings.service';

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
  ],
  template: `
    <header class="page-head">
      <p class="eyebrow">{{ 'arena.eyebrow' | t }}</p>
      <h1>{{ 'practice.title' | t }}</h1>
      <p>{{ 'practice.subtitle' | t }}</p>
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
            {{ ('arena.mode.' + m) | t }}
            @if (m !== 'quiz' && cleared(m)) {
              <span class="dot" title="cleared"></span>
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
      <p class="level-line">
        {{ detail()!.name | loc }} · {{ ('level.' + level()) | t }}
        @if (mode() !== 'quiz') {
          <span class="sep">·</span>
          <span>{{ 'arena.xpHint' | t }}</span>
        }
      </p>

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
        <div class="toast" role="status">{{ toast() }}</div>
      }

      <p class="learn-link">
        <a [routerLink]="['/patterns', selectedId()]">{{ 'arena.backToLearn' | t }}</a>
      </p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 1120px;
      }
      .page-head .eyebrow {
        margin: 0;
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .page-head h1 {
        font-family: var(--font-display);
        font-size: clamp(1.9rem, 4vw, 2.6rem);
        margin: 0.25rem 0 0.4rem;
        letter-spacing: -0.03em;
      }
      .page-head p {
        color: var(--muted);
        max-width: 40rem;
      }
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 1.5rem;
        align-items: end;
        margin: 1.25rem 0 0.75rem;
      }
      .picker {
        display: grid;
        gap: 0.35rem;
        min-width: 14rem;
      }
      select {
        padding: 0.7rem 0.8rem;
        border-radius: 0.7rem;
        border: 1px solid var(--line);
        background: var(--surface);
        color: inherit;
      }
      .modes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .modes button {
        position: relative;
        padding: 0.55rem 0.9rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        font: inherit;
        font-size: 0.9rem;
      }
      .modes button.active {
        color: var(--ink);
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 12%, transparent);
      }
      .dot {
        display: inline-block;
        width: 0.4rem;
        height: 0.4rem;
        margin-inline-start: 0.35rem;
        border-radius: 50%;
        background: var(--accent);
        vertical-align: middle;
      }
      .level-line {
        color: var(--accent);
        font-family: var(--font-mono);
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }
      .sep {
        margin: 0 0.35rem;
        opacity: 0.5;
      }
      .toast {
        position: sticky;
        bottom: 1rem;
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 0.7rem;
        background: color-mix(in oklab, var(--accent) 16%, var(--surface));
        border: 1px solid color-mix(in oklab, var(--accent) 40%, var(--line));
        animation: rise 350ms ease both;
        font-family: var(--font-mono);
        font-size: 0.9rem;
      }
      .learn-link {
        margin-top: 1.5rem;
      }
      .learn-link a {
        color: var(--accent);
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
        : this.summaries()[0]?.id ?? 'factory-method';

    if (qMode && this.modes.includes(qMode)) {
      this.mode.set(qMode);
    }

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
