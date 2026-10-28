import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({ name: 'loc', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(map: Record<string, string> | null | undefined, fallback = ''): string {
    this.i18n.locale();
    return this.i18n.localize(map, fallback);
  }
}
