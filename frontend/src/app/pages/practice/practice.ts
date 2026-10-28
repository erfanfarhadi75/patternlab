import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PatternDetailDto, PatternSummaryDto } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';
import { QuizPanel } from '../../shared/quiz-panel';

@Component({
  selector: 'app-practice',
  imports: [FormsModule, TranslatePipe, LocalizePipe, QuizPanel],
  template: `
    <header class="page-head">
      <h1>{{ 'practice.title' | t }}</h1>
      <p>{{ 'practice.subtitle' | t }}</p>
    </header>

    <label class="picker">
      <span>{{ 'practice.pick' | t }}</span>
      <select [ngModel]="selectedId()" (ngModelChange)="select($event)">
        @for (p of summaries(); track p.id) {
          <option [value]="p.id">{{ p.name | loc }}</option>
        }
      </select>
    </label>

    @if (loading()) {
      <p class="muted">{{ 'loading' | t }}</p>
    } @else if (!detail()) {
      <p class="muted">{{ 'practice.empty' | t }}</p>
    } @else {
      <p class="level-line">{{ ('level.' + level()) | t }}</p>
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
  `,
  styles: [
    `
      .page-head h1 {
        font-family: var(--font-display);
        font-size: clamp(1.8rem, 4vw, 2.4rem);
        margin: 0 0 0.4rem;
      }
      .page-head p {
        color: var(--muted);
      }
      .picker {
        display: grid;
        gap: 0.4rem;
        margin: 1.2rem 0;
        max-width: 24rem;
      }
      select {
        padding: 0.7rem 0.8rem;
        border-radius: 0.7rem;
        border: 1px solid var(--line);
        background: var(--surface);
        color: inherit;
      }
      .level-line {
        color: var(--accent);
        font-family: var(--font-mono);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class PracticePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly settings = inject(SettingsService);
  readonly progress = inject(ProgressStoreService);

  readonly summaries = signal<PatternSummaryDto[]>([]);
  readonly selectedId = signal('factory-method');
  readonly detail = signal<PatternDetailDto | null>(null);
  readonly loading = signal(true);
  readonly level = computed(() => this.settings.settings().level);
  readonly exercises = computed(() => {
    const d = this.detail();
    if (!d) return [];
    return d.exercises.filter((e) => e.level === this.level());
  });

  async ngOnInit(): Promise<void> {
    await this.progress.refresh();
    const catalog = await firstValueFrom(this.api.getCatalog());
    this.summaries.set(catalog.patterns);
    if (catalog.patterns.length) {
      this.selectedId.set(catalog.patterns[0].id);
      await this.select(catalog.patterns[0].id);
    } else {
      this.loading.set(false);
    }
  }

  async select(id: string): Promise<void> {
    this.selectedId.set(id);
    this.loading.set(true);
    try {
      const detail = await firstValueFrom(this.api.getPattern(id));
      this.detail.set(detail);
    } catch {
      this.detail.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
