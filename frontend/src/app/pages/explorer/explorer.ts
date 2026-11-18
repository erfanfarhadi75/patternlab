import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PatternSummaryDto } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LocalizePipe } from '../../core/pipes/localize.pipe';

@Component({
  selector: 'app-explorer',
  imports: [FormsModule, RouterLink, TranslatePipe, LocalizePipe],
  template: `
    <header class="page-head">
      <h1>{{ 'explorer.title' | t }}</h1>
      <p>{{ 'explorer.subtitle' | t }}</p>
    </header>

    <div class="toolbar">
      <label class="sr-only" for="q">{{ 'search.placeholder' | t }}</label>
      <input
        id="q"
        type="search"
        [placeholder]="'search.placeholder' | t"
        [(ngModel)]="query"
        (ngModelChange)="reload()"
      />
      <div class="filters" role="group" [attr.aria-label]="'filter.all' | t">
        @for (f of filters; track f) {
          <button type="button" class="chip" [class.active]="category() === f" (click)="setCategory(f)">
            {{ ('filter.' + f) | t }}
          </button>
        }
      </div>
    </div>

    @if (loading()) {
      <p class="muted">{{ 'loading' | t }}</p>
    } @else if (error()) {
      <p class="error">{{ 'explorer.error' | t }}</p>
    } @else if (!patterns().length) {
      <p class="muted">{{ 'explorer.empty' | t }}</p>
    } @else {
      <ul class="list">
        @for (p of patterns(); track p.id) {
          <li>
            <a [routerLink]="['/patterns', p.id]">
              <span class="cat">{{ ('filter.' + p.categoryId) | t }}</span>
              <strong>{{ p.name | loc }}</strong>
              <span class="intent">{{ p.intent | loc }}</span>
            </a>
          </li>
        }
      </ul>
    }
  `,
  styles: [
    `
      .page-head h1 {
        font-family: var(--font-display);
        font-size: clamp(1.8rem, 4vw, 2.4rem);
        margin: 0 0 0.4rem;
        letter-spacing: -0.03em;
      }
      .page-head p {
        color: var(--muted);
        margin: 0 0 1.5rem;
      }
      .toolbar {
        display: grid;
        gap: 0.9rem;
        margin-bottom: 1.5rem;
      }
      input[type='search'] {
        width: min(100%, 28rem);
        padding: 0.75rem 1rem;
        border-radius: 0.8rem;
        border: 1px solid var(--line);
        background: color-mix(in oklab, var(--surface) 85%, transparent);
        color: inherit;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }
      .chip {
        border: 1px solid var(--line);
        background: transparent;
        color: inherit;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        cursor: pointer;
      }
      .chip.active {
        border-color: var(--accent);
        background: color-mix(in oklab, var(--accent) 14%, transparent);
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0;
      }
      .list a {
        display: grid;
        gap: 0.3rem;
        padding: 1.1rem 0;
        border-top: 1px solid var(--line);
        text-decoration: none;
        color: inherit;
      }
      .list li:last-child a {
        border-bottom: 1px solid var(--line);
      }
      .cat {
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .intent {
        color: var(--muted);
        line-height: 1.45;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
    `,
  ],
})
export class ExplorerPage implements OnInit {
  private readonly api = inject(ApiService);
  readonly filters = ['all', 'creational', 'structural', 'behavioral'] as const;
  query = '';
  readonly category = signal('all');
  readonly patterns = signal<PatternSummaryDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    void this.reload();
  }

  setCategory(f: string): void {
    this.category.set(f);
    void this.reload();
  }

  reload(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.fetch(), 180);
  }

  private async fetch(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const cat = this.category() === 'all' ? undefined : this.category();
      const data = await firstValueFrom(this.api.getCatalog(cat, this.query.trim() || undefined));
      this.patterns.set(data.patterns);
    } catch {
      this.error.set(true);
      this.patterns.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
