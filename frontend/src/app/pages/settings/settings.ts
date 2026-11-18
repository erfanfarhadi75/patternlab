import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LearningLevel, Locale, ThemeMode } from '../../core/models/models';
import { I18nService } from '../../core/services/i18n.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslatePipe],
  template: `
    <header class="page-head">
      <h1>{{ 'settings.title' | t }}</h1>
      <p>{{ 'settings.subtitle' | t }}</p>
    </header>

    <form class="form" (submit)="$event.preventDefault()">
      <fieldset>
        <legend>{{ 'settings.language' | t }}</legend>
        <label
          ><input type="radio" name="locale" value="en" [checked]="settings.settings().locale === 'en'" (change)="setLocale('en')" />
          English</label
        >
        <label
          ><input type="radio" name="locale" value="fa" [checked]="settings.settings().locale === 'fa'" (change)="setLocale('fa')" />
          فارسی</label
        >
      </fieldset>

      <fieldset>
        <legend>{{ 'settings.level' | t }}</legend>
        <p class="help">{{ 'settings.levelHelp' | t }}</p>
        @for (lvl of levels; track lvl) {
          <label>
            <input
              type="radio"
              name="level"
              [value]="lvl"
              [checked]="settings.settings().level === lvl"
              (change)="setLevel(lvl)"
            />
            {{ ('level.' + lvl) | t }}
          </label>
        }
      </fieldset>

      <fieldset>
        <legend>{{ 'settings.theme' | t }}</legend>
        <label
          ><input
            type="radio"
            name="theme"
            value="light"
            [checked]="settings.settings().theme === 'light'"
            (change)="setTheme('light')"
          />
          {{ 'settings.themeLight' | t }}</label
        >
        <label
          ><input
            type="radio"
            name="theme"
            value="dark"
            [checked]="settings.settings().theme === 'dark'"
            (change)="setTheme('dark')"
          />
          {{ 'settings.themeDark' | t }}</label
        >
      </fieldset>

      <label class="check">
        <input
          type="checkbox"
          [checked]="settings.settings().reduceMotion"
          (change)="setMotion($any($event.target).checked)"
        />
        {{ 'settings.reduceMotion' | t }}
      </label>
    </form>
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
      .form {
        display: grid;
        gap: 1.4rem;
        max-width: 32rem;
        margin-top: 1.5rem;
      }
      fieldset {
        border: 1px solid var(--line);
        border-radius: 0.9rem;
        padding: 1rem 1.1rem;
        display: grid;
        gap: 0.55rem;
      }
      legend {
        padding: 0 0.35rem;
        font-weight: 600;
      }
      .help {
        margin: 0;
        color: var(--muted);
        font-size: 0.9rem;
      }
      label {
        display: flex;
        gap: 0.55rem;
        align-items: center;
      }
      .check {
        padding: 0.4rem 0;
      }
    `,
  ],
})
export class SettingsPage {
  readonly settings = inject(SettingsService);
  private readonly i18n = inject(I18nService);
  readonly levels: LearningLevel[] = ['junior', 'mid', 'senior'];

  setLocale(locale: Locale): void {
    this.settings.setLocale(locale);
    this.i18n.applyDocument();
  }

  setLevel(level: LearningLevel): void {
    this.settings.setLevel(level);
  }

  setTheme(theme: ThemeMode): void {
    this.settings.setTheme(theme);
    this.i18n.applyDocument();
  }

  setMotion(reduceMotion: boolean): void {
    this.settings.setReduceMotion(reduceMotion);
    this.i18n.applyDocument();
  }
}
