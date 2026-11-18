import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PatternDetailDto, QuizQuestionDto } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { QuizPanel } from '../../shared/quiz-panel';

@Component({
  selector: 'app-pattern-detail',
  imports: [RouterLink, TranslatePipe, LocalizePipe, QuizPanel],
  template: `
    @if (loading()) {
      <p class="muted">{{ 'detail.loading' | t }}</p>
    } @else if (error() || !pattern()) {
      <p class="error">{{ 'detail.error' | t }}</p>
      <button type="button" class="btn ghost" (click)="load()">{{ 'error.retry' | t }}</button>
    } @else {
      <article>
        <header class="head">
          <p class="cat">{{ ('filter.' + pattern()!.categoryId) | t }}</p>
          <h1>{{ pattern()!.name | loc }}</h1>
          <p class="tag">{{ pattern()!.tagline | loc }}</p>
          <p><span class="label">{{ 'detail.intent' | t }}:</span> {{ pattern()!.intent | loc }}</p>
          <div class="tabs" role="tablist">
            <button type="button" role="tab" [class.active]="tab() === 'learn'" (click)="tab.set('learn')">
              {{ 'mode.learn' | t }}
            </button>
            <button type="button" role="tab" [class.active]="tab() === 'quiz'" (click)="tab.set('quiz')">
              {{ 'mode.quiz' | t }}
            </button>
            <span class="soon" title="{{ 'coming.soon.body' | t }}">{{ 'mode.comingSoon' | t }}</span>
          </div>
        </header>

        @if (tab() === 'learn') {
          <section class="learn">
            <h2>{{ 'detail.sections' | t }} · {{ ('level.' + level()) | t }}</h2>
            @for (section of pattern()!.sections; track section.id) {
              <section class="block">
                <h3>{{ section.title | loc }}</h3>
                <p class="body">{{ levelBody(section.id) }}</p>
                @if (levelCode(section.id); as code) {
                  <div class="code-wrap" dir="ltr">
                    <div class="code-label">{{ 'detail.code' | t }}</div>
                    <pre><code>{{ code }}</code></pre>
                  </div>
                }
                @if (levelWalk(section.id); as walk) {
                  <p class="walk"><strong>{{ 'detail.walkthrough' | t }}:</strong> {{ walk }}</p>
                }
              </section>
            }
            <div class="actions">
              @if (lessonDone()) {
                <span class="done">{{ 'cta.lessonDone' | t }}</span>
              } @else {
                <button type="button" class="btn primary" (click)="completeLesson()">
                  {{ 'cta.markComplete' | t }}
                </button>
              }
            </div>
          </section>
        } @else {
          <section class="practice">
            <h2>{{ 'detail.exercises' | t }}</h2>
            @for (q of exercises(); track q.id) {
              <app-quiz-panel
                [patternId]="pattern()!.id"
                [question]="q"
                [locked]="!!q.requiresUnlock && !progress.hasUnlock('advanced-observer')"
              />
            }
            @if (!exercises().length) {
              <p class="muted">{{ 'practice.empty' | t }}</p>
            }
          </section>
        }

        <footer class="similar">
          <h2>{{ 'detail.similar' | t }}</h2>
          <p class="muted">{{ pattern()!.similarPatternIds.join(' · ') }}</p>
          <p class="muted soon-note">{{ 'coming.soon.body' | t }}</p>
          <a routerLink="/explorer" class="btn ghost">{{ 'cta.explore' | t }}</a>
        </footer>
      </article>
    }
  `,
  styles: [
    `
      .head h1 {
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 3rem);
        letter-spacing: -0.03em;
        margin: 0.2rem 0 0.5rem;
      }
      .cat {
        text-transform: uppercase;
        letter-spacing: 0.07em;
        font-size: 0.75rem;
        color: var(--accent);
        margin: 0;
      }
      .tag {
        color: var(--muted);
        font-size: 1.05rem;
        max-width: 40rem;
      }
      .label {
        font-weight: 600;
      }
      .tabs {
        display: flex;
        gap: 0.4rem;
        margin: 1.4rem 0 1rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .tabs button {
        border: 1px solid var(--line);
        background: transparent;
        color: inherit;
        padding: 0.45rem 0.9rem;
        border-radius: 999px;
        cursor: pointer;
      }
      .tabs button.active {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 14%, transparent);
      }
      .soon {
        font-size: 0.8rem;
        color: var(--muted);
        margin-inline-start: 0.4rem;
      }
      .block {
        padding: 1.2rem 0;
        border-top: 1px solid var(--line);
      }
      .block h3 {
        font-family: var(--font-display);
        margin: 0 0 0.55rem;
      }
      .body,
      .walk {
        line-height: 1.65;
        color: var(--ink);
      }
      .code-wrap {
        margin: 1rem 0;
        border: 1px solid var(--line);
        border-radius: 0.9rem;
        overflow: hidden;
        background: #0f1418;
        color: #d7e0e6;
      }
      .code-label {
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.55rem 0.9rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: #9bb0bc;
      }
      pre {
        margin: 0;
        padding: 1rem;
        overflow: auto;
        font-family: var(--font-mono);
        font-size: 0.86rem;
        line-height: 1.55;
        direction: ltr;
        text-align: left;
      }
      .actions {
        margin: 1.2rem 0;
      }
      .done {
        color: var(--accent);
        font-family: var(--font-mono);
      }
      .similar {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--line);
      }
      .soon-note {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class PatternDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly settings = inject(SettingsService);
  readonly progress = inject(ProgressStoreService);

  readonly pattern = signal<PatternDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly tab = signal<'learn' | 'quiz'>('learn');
  readonly level = computed(() => this.settings.settings().level);
  readonly lessonDone = computed(() => {
    const p = this.pattern();
    return p ? this.progress.isLessonComplete(p.id, this.level()) : false;
  });
  readonly exercises = computed(() => {
    const p = this.pattern();
    if (!p) return [] as QuizQuestionDto[];
    return p.exercises.filter((e) => e.level === this.level());
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => void this.load());
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.error.set(false);
    try {
      await this.progress.refresh();
      const detail = await firstValueFrom(this.api.getPattern(id));
      this.pattern.set(detail);
    } catch {
      this.error.set(true);
      this.pattern.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  levelBody(sectionId: string): string {
    const section = this.pattern()?.sections.find((s) => s.id === sectionId);
    const text = section?.byLevel[this.level()];
    const locale = this.settings.settings().locale;
    return text?.body?.[locale] ?? text?.body?.['en'] ?? '';
  }

  levelCode(sectionId: string): string | null {
    const section = this.pattern()?.sections.find((s) => s.id === sectionId);
    return section?.byLevel[this.level()]?.code ?? null;
  }

  levelWalk(sectionId: string): string | null {
    const section = this.pattern()?.sections.find((s) => s.id === sectionId);
    const walk = section?.byLevel[this.level()]?.codeWalkthrough;
    if (!walk) return null;
    const locale = this.settings.settings().locale;
    return walk[locale] ?? walk['en'] ?? null;
  }

  async completeLesson(): Promise<void> {
    const p = this.pattern();
    if (!p) return;
    await this.progress.completeLesson(p.id);
  }
}
