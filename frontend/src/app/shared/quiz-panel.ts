import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizQuestionDto } from '../core/models/models';
import { I18nService } from '../core/services/i18n.service';
import { ProgressStoreService } from '../core/services/progress-store.service';
import { TranslatePipe } from '../core/pipes/translate.pipe';
import { LocalizePipe } from '../core/pipes/localize.pipe';

@Component({
  selector: 'app-quiz-panel',
  imports: [CommonModule, TranslatePipe, LocalizePipe],
  template: `
    <article class="quiz" [class.locked]="locked">
      <header class="quiz__head">
        <span class="pill">{{ ('mode.' + question.kind) | t }}</span>
        <span class="pill muted">{{ ('level.' + question.level) | t }}</span>
        <span class="xp">{{ question.xpReward }} XP</span>
      </header>

      @if (locked) {
        <p class="lock">{{ 'detail.locked' | t }}</p>
      } @else {
        <h3>{{ question.prompt | loc }}</h3>
        <ul class="options">
          @for (opt of options(); track $index) {
            <li>
              <button
                type="button"
                class="option"
                [class.selected]="selected() === $index"
                [disabled]="revealed()"
                (click)="selected.set($index)"
              >
                {{ opt }}
              </button>
            </li>
          }
        </ul>

        <div class="actions">
          @if (!revealed()) {
            <button type="button" class="btn primary" [disabled]="selected() === null" (click)="check()">
              {{ 'cta.checkAnswer' | t }}
            </button>
          } @else {
            <button type="button" class="btn ghost" (click)="reset()">{{ 'cta.tryAgain' | t }}</button>
          }
        </div>

        @if (revealed()) {
          <div class="result" [class.ok]="correct()" [class.bad]="!correct()">
            <strong>{{ (correct() ? 'quiz.correct' : 'quiz.incorrect') | t }}</strong>
            <p>{{ explanation() }}</p>
            @if (xpAwarded() > 0) {
              <p class="gain">{{ 'quiz.xpGained' | t: { xp: xpAwarded() } }}</p>
            } @else if (correct()) {
              <p class="gain">{{ 'quiz.already' | t }}</p>
            }
          </div>
        }
      }
    </article>
  `,
  styles: [
    `
      .quiz {
        padding: 1.25rem 0;
        border-top: 1px solid var(--line);
      }
      .quiz__head {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
      }
      .pill {
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        border: 1px solid var(--line);
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
      }
      .pill.muted {
        opacity: 0.7;
      }
      .xp {
        margin-inline-start: auto;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--accent);
      }
      h3 {
        font-family: var(--font-display);
        font-weight: 560;
        font-size: 1.15rem;
        margin: 0 0 1rem;
        line-height: 1.35;
      }
      .options {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.55rem;
      }
      .option {
        width: 100%;
        text-align: start;
        padding: 0.85rem 1rem;
        border-radius: 0.75rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 88%, transparent);
        color: inherit;
        cursor: pointer;
        transition: border-color 160ms ease, transform 160ms ease;
      }
      .option:hover:not(:disabled) {
        border-color: var(--accent);
      }
      .option.selected {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 12%, var(--surface));
      }
      .actions {
        margin-top: 1rem;
      }
      .result {
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border-radius: 0.75rem;
        border: 1px solid var(--line);
      }
      .result.ok {
        border-color: color-mix(in oklab, #2f9e7b 50%, var(--line));
      }
      .result.bad {
        border-color: color-mix(in oklab, #c45c4a 50%, var(--line));
      }
      .gain {
        color: var(--accent);
        font-family: var(--font-mono);
      }
      .lock {
        opacity: 0.75;
      }
    `,
  ],
})
export class QuizPanel {
  @Input({ required: true }) patternId!: string;
  @Input({ required: true }) question!: QuizQuestionDto;
  @Input() locked = false;

  private readonly i18n = inject(I18nService);
  private readonly progress = inject(ProgressStoreService);

  readonly selected = signal<number | null>(null);
  readonly revealed = signal(false);
  readonly correct = signal(false);
  readonly explanation = signal('');
  readonly xpAwarded = signal(0);

  options(): string[] {
    const locale = this.i18n.locale();
    return this.question.options[locale] ?? this.question.options['en'] ?? [];
  }

  async check(): Promise<void> {
    const idx = this.selected();
    if (idx === null) return;
    const result = await this.progress.submitAnswer(this.patternId, this.question.id, idx);
    this.correct.set(result.correct);
    this.explanation.set(this.i18n.localize(result.explanation));
    this.xpAwarded.set(result.xpAwarded);
    this.revealed.set(true);
  }

  reset(): void {
    this.selected.set(null);
    this.revealed.set(false);
    this.correct.set(false);
    this.explanation.set('');
    this.xpAwarded.set(0);
  }
}
