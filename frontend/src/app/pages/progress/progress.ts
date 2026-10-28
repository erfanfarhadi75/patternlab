import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-progress',
  imports: [TranslatePipe, DatePipe],
  template: `
    <header class="page-head">
      <h1>{{ 'progress.title' | t }}</h1>
      <p>{{ 'progress.subtitle' | t }}</p>
    </header>

    @if (store.loading()) {
      <p class="muted">{{ 'loading' | t }}</p>
    } @else {
      <div class="grid">
        <div class="stat">
          <span>{{ 'dashboard.statsXp' | t }}</span>
          <strong>{{ store.progress()?.xp ?? 0 }}</strong>
          <small>{{ store.progress()?.xpToNextLevel ?? 100 }} XP → next</small>
        </div>
        <div class="stat">
          <span>{{ 'dashboard.statsLevel' | t }}</span>
          <strong>{{ store.progress()?.level ?? 1 }}</strong>
        </div>
        <div class="stat">
          <span>{{ 'dashboard.statsStreak' | t }}</span>
          <strong>{{ store.progress()?.streakDays ?? 0 }}</strong>
        </div>
        <div class="stat">
          <span>{{ 'progress.completedPatterns' | t }}</span>
          <strong>{{ store.progress()?.completedLessons?.length ?? 0 }}</strong>
        </div>
        <div class="stat">
          <span>{{ 'progress.completedExercises' | t }}</span>
          <strong>{{ store.progress()?.completedExercises?.length ?? 0 }}</strong>
        </div>
      </div>

      <section class="achievements">
        <h2>{{ 'progress.achievements' | t }}</h2>
        @if (!(store.progress()?.achievements?.length)) {
          <p class="muted">{{ 'progress.none' | t }}</p>
        } @else {
          <ul>
            @for (a of store.progress()!.achievements; track a.id) {
              <li>
                <strong>{{ ('achievement.' + a.id) | t }}</strong>
                <time>{{ a.unlockedAt | date: 'mediumDate' }}</time>
              </li>
            }
          </ul>
        }
      </section>
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
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }
      .stat {
        padding: 1rem 0;
        border-top: 1px solid var(--line);
      }
      .stat span {
        display: block;
        color: var(--muted);
        font-size: 0.8rem;
      }
      .stat strong {
        font-family: var(--font-mono);
        font-size: 1.6rem;
      }
      .stat small {
        display: block;
        color: var(--muted);
      }
      .achievements h2 {
        font-family: var(--font-display);
        font-size: 1.2rem;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem 0;
        border-top: 1px solid var(--line);
      }
      time {
        color: var(--muted);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class ProgressPage implements OnInit {
  readonly store = inject(ProgressStoreService);

  ngOnInit(): void {
    void this.store.refresh();
  }
}
