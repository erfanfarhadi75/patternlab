import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CatalogResponse,
  PatternDetailDto,
  ProgressSnapshotDto,
  SubmitAnswerResponse,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://127.0.0.1:5287/api';

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
}
