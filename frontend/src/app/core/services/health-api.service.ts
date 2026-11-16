import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

export interface HealthStatusResponse {
  status: 'ok' | 'degraded';
  database: string;
  uptimeSeconds: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class HealthApiService {
  private readonly http = inject(HttpClient);

  readonly state = signal<HealthStatusResponse | null>(null);
  readonly unreachable = signal(false);

  checkHealth(): void {
    this.http
      .get<HealthStatusResponse>('/api/health')
      .pipe(
        catchError(() => {
          this.unreachable.set(true);
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.unreachable.set(false);
          this.state.set(result);
        }
      });
  }
}

