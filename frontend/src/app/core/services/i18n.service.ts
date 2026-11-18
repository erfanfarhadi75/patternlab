import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Locale } from '../models/models';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(SettingsService);
  private readonly catalogs = signal<Record<Locale, Record<string, string>>>({
    en: {},
    fa: {},
  });
  private readonly ready = signal(false);

  readonly locale = computed(() => this.settings.settings().locale);
  readonly dir = computed(() => (this.locale() === 'fa' ? 'rtl' : 'ltr'));
  readonly isReady = this.ready.asReadonly();

  async init(): Promise<void> {
    const [en, fa] = await Promise.all([
      firstValueFrom(this.http.get<Record<string, string>>('/assets/i18n/en.json')),
      firstValueFrom(this.http.get<Record<string, string>>('/assets/i18n/fa.json')),
    ]);
    this.catalogs.set({ en, fa });
    this.applyDocument();
    this.ready.set(true);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const table = this.catalogs()[this.locale()] ?? {};
    let value = table[key] ?? this.catalogs().en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replaceAll(`{{${k}}}`, String(v));
      }
    }
    return value;
  }

  localize(map: Record<string, string> | null | undefined, fallback = ''): string {
    if (!map) return fallback;
    return map[this.locale()] ?? map['en'] ?? Object.values(map)[0] ?? fallback;
  }

  applyDocument(): void {
    const locale = this.locale();
    const dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.body.dataset['theme'] = this.settings.settings().theme;
    document.body.classList.toggle('reduce-motion', this.settings.settings().reduceMotion);
  }
}
