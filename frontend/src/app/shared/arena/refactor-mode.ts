import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { RefactorChallenge } from './arena.models';
import { ArenaIcon } from './arena-icon';

@Component({
  selector: 'app-refactor-mode',
  imports: [TranslatePipe, LocalizePipe, ArenaIcon],
  template: `
    <div class="refactor" [class.won]="passed()">
      <header class="head">
        <app-arena-icon name="refactor" size="2rem" tone="amber" />
        <div>
          <h3>{{ challenge.title | loc }}</h3>
        </div>
        <div class="meter" dir="ltr">
          <app-arena-icon name="xp" size="1.2rem" tone="amber" />
          <span>{{ score() || '—' }}</span>
        </div>
      </header>

      <div class="smell">
        <img src="/assets/arena/spark.gif.svg" width="40" height="40" alt="" />
        <div>
          <span class="eyebrow">{{ 'arena.refactor.smell' | t }}</span>
          <p>{{ challenge.smell | loc }}</p>
        </div>
      </div>

      <ul class="moves">
        @for (move of challenge.moves; track move.id) {
          <li>
            <button
              type="button"
              class="move"
              [class.on]="selected().has(move.id)"
              (click)="toggle(move.id)"
            >
              <span class="check" aria-hidden="true">
                @if (selected().has(move.id)) {
                  <app-arena-icon name="trophy" size="1.05rem" tone="accent" />
                } @else {
                  <app-arena-icon name="blocks" size="1.05rem" tone="muted" />
                }
              </span>
              <span>{{ move.label | loc }}</span>
            </button>
          </li>
        }
      </ul>

      <div class="actions">
        <button type="button" class="btn ghost" (click)="reset()">{{ 'arena.reset' | t }}</button>
        <button type="button" class="btn ghost punch" [disabled]="passed()" (click)="solveComplete()">
          <app-arena-icon name="xp" size="1.1rem" tone="amber" />
          {{ 'arena.solve' | t }}
        </button>
        <button type="button" class="btn primary punch" (click)="grade()">
          <app-arena-icon name="play" size="1.1rem" />
          {{ 'arena.refactor.score' | t }}
        </button>
      </div>

      @if (feedback()) {
        <div class="feedback" [class.ok]="passed()" [class.bad]="!passed()">
          <app-arena-icon [name]="passed() ? 'trophy' : 'xp'" size="1.3rem" [tone]="passed() ? 'amber' : 'muted'" />
          <div>
            <p>{{ feedback() }}</p>
            <p class="scoreline" dir="ltr">{{ 'arena.refactor.quality' | t: { score: score() } }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 0.85rem;
      }
      h3 {
        font-family: var(--font-display);
        margin: 0;
        font-size: 1.2rem;
      }
      .meter {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-family: var(--font-mono);
        font-weight: 600;
        padding: 0.3rem 0.6rem;
        border-radius: 999px;
        border: 1px solid var(--line);
      }
      .smell {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.75rem;
        align-items: start;
        padding: 0.85rem 1rem;
        border-radius: 0.9rem;
        background: color-mix(in oklab, var(--accent-2) 12%, var(--surface));
        border: 1px solid color-mix(in oklab, var(--accent-2) 35%, var(--line));
        margin-bottom: 0.9rem;
      }
      .eyebrow {
        display: block;
        font-size: 0.7rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent-2);
        margin-bottom: 0.2rem;
      }
      .smell p {
        margin: 0;
        font-family: var(--font-display);
        line-height: 1.4;
      }
      .moves {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.45rem;
      }
      .move {
        width: 100%;
        display: grid;
        grid-template-columns: 1.5rem 1fr;
        gap: 0.65rem;
        align-items: center;
        text-align: start;
        padding: 0.8rem 0.95rem;
        border-radius: 0.85rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 90%, transparent);
        color: inherit;
        cursor: pointer;
        transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
      }
      .move:hover {
        transform: translateY(-1px);
      }
      .move.on {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 14%, var(--surface));
      }
      .actions {
        display: flex;
        gap: 0.55rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }
      .punch {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .feedback {
        margin-top: 0.85rem;
        padding: 0.75rem 1rem;
        border-radius: 0.85rem;
        border: 1px solid var(--line);
        display: flex;
        gap: 0.55rem;
        align-items: flex-start;
      }
      .feedback p {
        margin: 0;
        font-family: var(--font-display);
      }
      .scoreline {
        font-family: var(--font-mono);
        color: var(--accent);
        margin-top: 0.25rem !important;
        font-size: 0.9rem;
      }
      .feedback.ok {
        border-color: color-mix(in oklab, #2f9e7b 50%, var(--line));
        background: color-mix(in oklab, var(--accent) 10%, var(--surface));
      }
      .feedback.bad {
        border-color: color-mix(in oklab, #c45c4a 50%, var(--line));
      }
    `,
  ],
})
export class RefactorMode implements OnChanges {
  @Input({ required: true }) challenge!: RefactorChallenge;
  @Output() readonly cleared = new EventEmitter<{ score: number; passed: boolean }>();

  private readonly i18n = inject(I18nService);

  readonly selected = signal<Set<string>>(new Set());
  readonly feedback = signal('');
  readonly passed = signal(false);
  readonly score = signal(0);

  ngOnChanges(): void {
    this.reset();
  }

  toggle(id: string): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    this.feedback.set('');
  }

  reset(): void {
    this.selected.set(new Set());
    this.feedback.set('');
    this.passed.set(false);
    this.score.set(0);
  }

  solveComplete(): void {
    if (this.passed()) return;
    const correct = new Set(
      this.challenge.moves.filter((m) => m.correct).map((m) => m.id)
    );
    this.selected.set(correct);
    this.grade();
  }

  grade(): void {
    const picked = this.selected();
    const correctMoves = this.challenge.moves.filter((m) => m.correct);
    const incorrectMoves = this.challenge.moves.filter((m) => !m.correct);
    let hits = 0;
    let misses = 0;
    for (const m of correctMoves) if (picked.has(m.id)) hits += 1;
    for (const m of incorrectMoves) if (picked.has(m.id)) misses += 1;
    const raw = (hits / correctMoves.length) * 100 - misses * 25;
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const ok = hits >= this.challenge.minCorrect && misses === 0;
    this.score.set(score);
    this.passed.set(ok);
    this.feedback.set(ok ? this.i18n.t('arena.refactor.ok') : this.i18n.t('arena.refactor.bad'));
    this.cleared.emit({ score, passed: ok });
  }
}
