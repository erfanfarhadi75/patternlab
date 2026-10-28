import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { CodeChallenge } from './arena.models';

interface RenderPart {
  type: 'text' | 'blank';
  value: string;
}

@Component({
  selector: 'app-code-mode',
  imports: [FormsModule, TranslatePipe, LocalizePipe],
  template: `
    <div class="code-mode">
      <header>
        <h3>{{ challenge.title | loc }}</h3>
        <p class="brief">{{ challenge.brief | loc }}</p>
      </header>

      <div class="editor" dir="ltr">
        @for (line of rendered(); track $index) {
          <div class="line">
            <span class="ln">{{ $index + 1 }}</span>
            <code>
              @for (part of line; track $index) {
                @if (part.type === 'text') {
                  <span>{{ part.value }}</span>
                } @else {
                  <select
                    class="blank"
                    [ngModel]="answers()[part.value] ?? ''"
                    (ngModelChange)="setAnswer(part.value, $event)"
                  >
                    <option value="" disabled>{{ 'arena.pickBlank' | t }}</option>
                    @for (choice of choices(part.value); track choice) {
                      <option [value]="choice">{{ choice }}</option>
                    }
                  </select>
                }
              }
            </code>
          </div>
        }
      </div>

      <div class="actions">
        <button type="button" class="btn ghost" (click)="reset()">{{ 'arena.reset' | t }}</button>
        <button type="button" class="btn primary" (click)="grade()">{{ 'cta.checkAnswer' | t }}</button>
      </div>

      @if (feedback()) {
        <div class="feedback" [class.ok]="passed()" [class.bad]="!passed()">
          <p>{{ feedback() }}</p>
          @if (detail()) {
            <p class="detail">{{ detail() }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      h3 {
        font-family: var(--font-display);
        margin: 0 0 0.35rem;
        font-size: 1.2rem;
      }
      .brief {
        color: var(--muted);
        margin: 0 0 1rem;
      }
      .editor {
        border: 1px solid var(--line);
        border-radius: 0.8rem;
        background: color-mix(in oklab, var(--surface) 88%, #0b1c16);
        padding: 0.85rem 0.6rem;
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        line-height: 1.7;
      }
      .line {
        display: grid;
        grid-template-columns: 2.2rem 1fr;
        gap: 0.5rem;
        white-space: pre;
      }
      .ln {
        text-align: end;
        color: color-mix(in oklab, var(--muted) 70%, transparent);
        user-select: none;
      }
      .blank {
        display: inline-block;
        margin: 0 0.15rem;
        padding: 0.1rem 0.35rem;
        border-radius: 0.35rem;
        border: 1px solid color-mix(in oklab, var(--accent) 45%, var(--line));
        background: color-mix(in oklab, var(--accent) 12%, transparent);
        color: inherit;
        font: inherit;
        min-width: 7.5rem;
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
      .detail {
        color: var(--muted);
        margin: 0.35rem 0 0;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class CodeMode implements OnChanges {
  @Input({ required: true }) challenge!: CodeChallenge;
  @Output() readonly cleared = new EventEmitter<{ score: number; passed: boolean }>();

  private readonly i18n = inject(I18nService);

  readonly answers = signal<Record<string, string>>({});
  readonly feedback = signal('');
  readonly detail = signal('');
  readonly passed = signal(false);
  readonly rendered = signal<RenderPart[][]>([]);

  ngOnChanges(): void {
    this.reset();
    this.rendered.set(this.challenge.lines.map((line) => this.parseLine(line)));
    if (this.challenge.blanks.length) {
      // keep relation bar default unused
    }
  }

  choices(blankId: string): string[] {
    return this.challenge.blanks.find((b) => b.id === blankId)?.choices ?? [];
  }

  setAnswer(blankId: string, value: string): void {
    this.answers.update((a) => ({ ...a, [blankId]: value }));
    this.feedback.set('');
  }

  reset(): void {
    this.answers.set({});
    this.feedback.set('');
    this.detail.set('');
    this.passed.set(false);
  }

  grade(): void {
    let correct = 0;
    const missing: string[] = [];
    for (const blank of this.challenge.blanks) {
      const value = this.answers()[blank.id];
      if (value === blank.correct) correct += 1;
      else missing.push(blank.correct);
    }
    const total = this.challenge.blanks.length;
    const score = Math.round((correct / total) * 100);
    const ok = correct === total;
    this.passed.set(ok);
    this.feedback.set(
      ok ? this.i18n.t('arena.code.ok') : this.i18n.t('arena.code.bad', { correct, total })
    );
    this.detail.set(ok ? '' : this.i18n.t('arena.code.hint'));
    this.cleared.emit({ score, passed: ok });
  }

  private parseLine(line: string): RenderPart[] {
    const parts: RenderPart[] = [];
    const re = /\{\{(\w+)\}\}/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(line))) {
      if (match.index > last) {
        parts.push({ type: 'text', value: line.slice(last, match.index) });
      }
      parts.push({ type: 'blank', value: match[1] });
      last = match.index + match[0].length;
    }
    if (last < line.length) {
      parts.push({ type: 'text', value: line.slice(last) });
    }
    if (!parts.length) parts.push({ type: 'text', value: line || ' ' });
    return parts;
  }
}
