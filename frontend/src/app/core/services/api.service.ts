import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CatalogResponse,
  CompleteArenaResponse,
  PatternDetailDto,
  ProgressSnapshotDto,
  SubmitAnswerResponse,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  /** Same-origin `/api` in production (SPA served by API). Local `ng serve` uses proxy.conf.json. */
  private readonly base =
    (typeof globalThis !== 'undefined' &&
      (globalThis as { PATTERNLAB_API_BASE?: string }).PATTERNLAB_API_BASE) ||
    '/api';

  getCatalog(category?: string, q?: string): Observable<CatalogResponse> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (q) params = params.set('q', q);
    return this.http.get<CatalogResponse>(`${this.base}/patterns`, { params });
  }

  getPattern(id: string): Observable<PatternDetailDto> {
    return this.http.get<PatternDetailDto>(`${this.base}/patterns/${id}`);
  }

  getProgress(userId: string): Observable<ProgressSnapshotDto> {
    return this.http.get<ProgressSnapshotDto>(`${this.base}/progress/${userId}`);
  }

  completeLesson(
    userId: string,
    body: { patternId: string; level: string }
  ): Observable<ProgressSnapshotDto> {
    return this.http.post<ProgressSnapshotDto>(
      `${this.base}/progress/${userId}/lessons/complete`,
      body
    );
  }

  submitAnswer(
    userId: string,
    body: {
      patternId: string;
      exerciseId: string;
      selectedIndex: number;
      level: string;
    }
  ): Observable<SubmitAnswerResponse> {
    return this.http.post<SubmitAnswerResponse>(
      `${this.base}/progress/${userId}/exercises/submit`,
      body
    );
  }

  completeArena(
    userId: string,
    body: {
      patternId: string;
      challengeId: string;
      mode: string;
      passed: boolean;
      score: number;
    }
  ): Observable<CompleteArenaResponse> {
    return this.http.post<CompleteArenaResponse>(
      `${this.base}/progress/${userId}/arena/complete`,
      body
    );
  }
}
