import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type {
  AddContributionPayload,
  CreateGoalPayload,
  Goal,
  GoalsFilters,
  GoalsListResponse,
  GoalsSummary,
  UpdateGoalPayload,
} from '../models/goal.model';

const EMPTY_SUMMARY: GoalsSummary = {
  totalGoals: 0,
  activeGoals: 0,
  completedGoals: 0,
  totalTargetAmount: 0,
  totalSavedAmount: 0,
  overallProgressPercent: 0,
};

@Injectable({ providedIn: 'root' })
export class GoalsStoreService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/goals';

  readonly goals = signal<Goal[]>([]);
  readonly summary = signal<GoalsSummary>(EMPTY_SUMMARY);
  readonly loading = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly filters = signal<GoalsFilters>({});

  loadGoals(filters: GoalsFilters = this.filters()): void {
    this.filters.set(filters);
    this.loading.set(true);
    this.errorKey.set(null);

    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    this.http.get<GoalsListResponse>(this.baseUrl, { params }).subscribe({
      next: (res) => {
        this.goals.set(res.items);
        this.summary.set(res.summary);
        this.loading.set(false);
      },
      error: () => {
        this.errorKey.set('goals.states.loadError');
        this.loading.set(false);
      },
    });
  }

  createGoal(payload: CreateGoalPayload): Observable<Goal> {
    return this.http
      .post<Goal>(this.baseUrl, payload)
      .pipe(tap(() => this.loadGoals()));
  }

  updateGoal(id: string, payload: UpdateGoalPayload): Observable<Goal> {
    return this.http
      .patch<Goal>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this.loadGoals()));
  }

  addContribution(
    id: string,
    payload: AddContributionPayload,
  ): Observable<Goal> {
    return this.http
      .post<Goal>(`${this.baseUrl}/${id}/contributions`, payload)
      .pipe(tap(() => this.loadGoals()));
  }

  removeContribution(goalId: string, contributionId: string): Observable<Goal> {
    return this.http
      .delete<Goal>(`${this.baseUrl}/${goalId}/contributions/${contributionId}`)
      .pipe(tap(() => this.loadGoals()));
  }

  deleteGoal(id: string): Observable<{ deleted: true; id: string }> {
    return this.http
      .delete<{ deleted: true; id: string }>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.loadGoals()));
  }
}
