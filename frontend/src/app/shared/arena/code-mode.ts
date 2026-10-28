import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { CodeChallenge } from './arena.models';
import { ArenaIcon } from './arena-icon';

interface RenderPart {
  type: 'text' | 'blank';
  value: string;
}

@Component({
  selector: 'app-code-mode',
  imports: [FormsModule, TranslatePipe, LocalizePipe, ArenaIcon],
  template: `
    <div class="code-mode" [class.won]="passed()">
      <header class="head">
        <app-arena-icon name="code" size="2rem" tone="accent" />
        <div>
          <h3>{{ challenge.title | loc }}</h3>
          <p class="brief">{{ challenge.brief | loc }}</p>
        </div>
        <div class="lives" dir="ltr">
          <img src="/assets/arena/xp-spin.svg" width="26" height="26" alt="" />
          <span>{{ filled() }}/{{ challenge.blanks.length }}</span>
        </div>
      </header>

      <div class="editor" dir="ltr">
        <div class="editor__glow" aria-hidden="true"></div>
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
        <button type="button" class="btn primary punch" (click)="grade()">
          <app-arena-icon name="trophy" size="1.1rem" />
          {{ 'cta.checkAnswer' | t }}
        </button>
      </div>

      @if (feedback()) {
        <div class="feedback" [class.ok]="passed()" [class.bad]="!passed()">
          <app-arena-icon [name]="passed() ? 'trophy' : 'xp'" size="1.3rem" [tone]="passed() ? 'amber' : 'muted'" />
          <p>{{ feedback() }}</p>
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
        margin-bottom: 0.9rem;
      }
      h3 {
        font-family: var(--font-display);
        margin: 0;
        font-size: 1.2rem;
      }
      .brief {
        color: var(--muted);
        margin: 0.15rem 0 0;
        font-size: 0.92rem;
      }
      .lives {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-family: var(--font-mono);
        font-weight: 600;
        padding: 0.3rem 0.6rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--accent) 10%, transparent);
      }
      .editor {
        position: relative;
        border: 1px solid var(--line);
        border-radius: 1rem;
        background: #0f1714;
        color: #d7e7e0;
        padding: 0.95rem 0.65rem;
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.86rem;
        line-height: 1.75;
        box-shadow: inset 0 0 40px color-mix(in oklab, var(--accent) 12%, transparent);
      }
      .editor__glow {
        position: absolute;
        inset: auto -10% -30% auto;
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, color-mix(in oklab, var(--accent-2) 35%, transparent), transparent 70%);
        pointer-events: none;
      }
      .line {
        display: grid;
        grid-template-columns: 2.2rem 1fr;
        gap: 0.5rem;
        white-space: pre;
      }
      .ln {
        text-align: end;
        color: #6d857a;
        user-select: none;
      }
      .blank {
        display: inline-block;
        margin: 0 0.15rem;
        padding: 0.12rem 0.4rem;
        border-radius: 0.4rem;
        border: 1px solid color-mix(in oklab, #f59e0b 55%, #333);
        background: color-mix(in oklab, #f59e0b 18%, #12201a);
        color: #ffe8c2;
        font: inherit;
        min-width: 7.5rem;
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
        align-items: center;
        gap: 0.55rem;
      }
      .feedback p {
        margin: 0;
        font-family: var(--font-display);
      }
      .feedback.ok {
        border-color: color-mix(in oklab, #2f9e7b 50%, var(--line));
        background: color-mix(in oklab, var(--accent) 10%, var(--surface));
      }
      .feedback.bad {
        border-color: color-mix(in oklab, #c45c4a 50%, var(--line));
      }
      .won .editor {
        box-shadow:
          inset 0 0 40px color-mix(in oklab, var(--accent) 18%, transparent),
          0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent);
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
  readonly passed = signal(false);
  readonly rendered = signal<RenderPart[][]>([]);

  ngOnChanges(): void {
    this.reset();
    this.rendered.set(this.challenge.lines.map((line) => this.parseLine(line)));
  }

  filled(): number {
    return this.challenge.blanks.filter((b) => !!this.answers()[b.id]).length;
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
    this.passed.set(false);
  }

  grade(): void {
    let correct = 0;
    for (const blank of this.challenge.blanks) {
      if (this.answers()[blank.id] === blank.correct) correct += 1;
    }
    const total = this.challenge.blanks.length;
    const score = Math.round((correct / total) * 100);
    const ok = correct === total;
    this.passed.set(ok);
    this.feedback.set(
      ok ? this.i18n.t('arena.code.ok') : this.i18n.t('arena.code.bad', { correct, total })
    );
    this.cleared.emit({ score, passed: ok });
  }

  private parseLine(line: string): RenderPart[] {
    const parts: RenderPart[] = [];
    const re = /\{\{(\w+)\}\}/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(line))) {
      if (match.index > last) parts.push({ type: 'text', value: line.slice(last, match.index) });
      parts.push({ type: 'blank', value: match[1] });
      last = match.index + match[0].length;
    }
    if (last < line.length) parts.push({ type: 'text', value: line.slice(last) });
    if (!parts.length) parts.push({ type: 'text', value: line || ' ' });
    return parts;
  }
}
