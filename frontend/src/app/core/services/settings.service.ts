import { Injectable, signal } from '@angular/core';
import { LearningLevel, Locale, ThemeMode, UserSettings } from '../models/models';

const STORAGE_KEY = 'patternlab.settings.v1';

const DEFAULTS: UserSettings = {
  locale: 'en',
  level: 'junior',
  reduceMotion: false,
  theme: 'light',
  userId: 'local-learner',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings = signal<UserSettings>(this.read());
  readonly settings = this._settings.asReadonly();

  update(patch: Partial<UserSettings>): void {
    const next = { ...this._settings(), ...patch };
    this._settings.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  setLocale(locale: Locale): void {
    this.update({ locale });
  }

  setLevel(level: LearningLevel): void {
    this.update({ level });
  }

  setTheme(theme: ThemeMode): void {
    this.update({ theme });
  }

  setReduceMotion(reduceMotion: boolean): void {
    this.update({ reduceMotion });
  }

  private read(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }
}
