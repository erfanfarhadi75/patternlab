import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProgressSnapshotDto, SubmitAnswerResponse } from '../models/models';
import { ApiService } from './api.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ProgressStoreService {
  private readonly api = inject(ApiService);
  private readonly settings = inject(SettingsService);

  readonly progress = signal<ProgressSnapshotDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const userId = this.settings.settings().userId;
      const snap = await firstValueFrom(this.api.getProgress(userId));
      this.progress.set(snap);
    } catch {
      this.error.set('progress');
    } finally {
      this.loading.set(false);
    }
  }

  async completeLesson(patternId: string): Promise<ProgressSnapshotDto | null> {
    const userId = this.settings.settings().userId;
    const level = this.settings.settings().level;
    const snap = await firstValueFrom(this.api.completeLesson(userId, { patternId, level }));
    this.progress.set(snap);
    return snap;
  }

  async submitAnswer(
    patternId: string,
    exerciseId: string,
    selectedIndex: number
  ): Promise<SubmitAnswerResponse> {
    const userId = this.settings.settings().userId;
    const level = this.settings.settings().level;
    const result = await firstValueFrom(
      this.api.submitAnswer(userId, { patternId, exerciseId, selectedIndex, level })
    );
    this.progress.set(result.progress);
    return result;
  }

  isLessonComplete(patternId: string, level?: string): boolean {
    const lvl = level ?? this.settings.settings().level;
    const key = `${patternId}:${lvl}:lesson`;
    return this.progress()?.completedLessons.includes(key) ?? false;
  }

  isExerciseComplete(patternId: string, exerciseId: string): boolean {
    return this.progress()?.completedExercises.includes(`${patternId}:${exerciseId}`) ?? false;
  }

  hasUnlock(id: string): boolean {
    return this.progress()?.unlocks.includes(id) ?? false;
  }
}
