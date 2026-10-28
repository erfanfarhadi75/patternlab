import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { RefactorChallenge } from './arena.models';

@Component({
  selector: 'app-refactor-mode',
  imports: [TranslatePipe, LocalizePipe],
  template: `
    <div class="refactor">
      <header>
        <h3>{{ challenge.title | loc }}</h3>
        <div class="smell">
          <span class="eyebrow">{{ 'arena.refactor.smell' | t }}</span>
          <p>{{ challenge.smell | loc }}</p>
        </div>
        <p class="brief">{{ 'arena.refactor.brief' | t }}</p>
      </header>

      <ul class="moves">
        @for (move of challenge.moves; track move.id) {
          <li>
            <button
              type="button"
              class="move"
              [class.on]="selected().has(move.id)"
              (click)="toggle(move.id)"
            >
              <span class="check" aria-hidden="true">{{ selected().has(move.id) ? '✓' : '' }}</span>
              <span>{{ move.label | loc }}</span>
            </button>
          </li>
        }
      </ul>

      <div class="actions">
        <button type="button" class="btn ghost" (click)="reset()">{{ 'arena.reset' | t }}</button>
        <button type="button" class="btn primary" (click)="grade()">{{ 'arena.refactor.score' | t }}</button>
      </div>

      @if (feedback()) {
        <div class="feedback" [class.ok]="passed()" [class.bad]="!passed()">
          <p>{{ feedback() }}</p>
          <p class="score" dir="ltr">{{ 'arena.refactor.quality' | t: { score: score() } }}</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      h3 {
        font-family: var(--font-display);
        margin: 0 0 0.75rem;
        font-size: 1.2rem;
      }
      .smell {
        padding: 0.9rem 1rem;
        border-inline-start: 3px solid var(--accent-2);
        background: color-mix(in oklab, var(--accent-2) 8%, var(--surface));
        border-radius: 0 0.6rem 0.6rem 0;
        margin-bottom: 0.85rem;
      }
      :host-context([dir='rtl']) .smell {
        border-radius: 0.6rem 0 0 0.6rem;
      }
      .eyebrow {
        display: block;
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent-2);
        margin-bottom: 0.3rem;
      }
      .smell p {
        margin: 0;
        line-height: 1.5;
      }
      .brief {
        color: var(--muted);
        margin: 0 0 1rem;
      }
      .moves {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.5rem;
      }
      .move {
        width: 100%;
        display: grid;
        grid-template-columns: 1.4rem 1fr;
        gap: 0.65rem;
        align-items: start;
        text-align: start;
        padding: 0.85rem 1rem;
        border-radius: 0.7rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 90%, transparent);
        color: inherit;
        cursor: pointer;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .move.on {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 12%, var(--surface));
      }
      .check {
        font-family: var(--font-mono);
        color: var(--accent);
        line-height: 1.4;
      }
      .actions {
        display: flex;
        gap: 0.55rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }
      .feedback {
        margin-top: 0.9rem;
        padding: 0.85rem 1rem;
        border-radius: 0.7rem;
        border: 1px solid var(--line);
      }
      .feedback.ok {
        border-color: color-mix(in oklab, #2f9e7b 50%, var(--line));
      }
      .feedback.bad {
        border-color: color-mix(in oklab, #c45c4a 50%, var(--line));
      }
      .score {
        font-family: var(--font-mono);
        color: var(--accent);
        margin: 0.35rem 0 0;
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

  grade(): void {
    const picked = this.selected();
    const correctMoves = this.challenge.moves.filter((m) => m.correct);
    const incorrectMoves = this.challenge.moves.filter((m) => !m.correct);

    let hits = 0;
    let misses = 0;
    for (const m of correctMoves) {
      if (picked.has(m.id)) hits += 1;
    }
    for (const m of incorrectMoves) {
      if (picked.has(m.id)) misses += 1;
    }

    const raw = (hits / correctMoves.length) * 100 - misses * 25;
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const ok = hits >= this.challenge.minCorrect && misses === 0;

    this.score.set(score);
    this.passed.set(ok);
    this.feedback.set(
      ok ? this.i18n.t('arena.refactor.ok') : this.i18n.t('arena.refactor.bad')
    );
    this.cleared.emit({ score, passed: ok });
  }
}
