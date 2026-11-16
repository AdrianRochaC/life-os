import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GoalsStoreService } from './goals-store.service';

describe('GoalsStoreService', () => {
  let store: GoalsStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(GoalsStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads goals and updates signals with query params', () => {
    store.loadGoals({ status: 'active', search: 'Moto' });

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/api/goals' &&
        request.params.get('status') === 'active' &&
        request.params.get('search') === 'Moto',
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      summary: {
        totalGoals: 1,
        activeGoals: 1,
        completedGoals: 0,
        totalTargetAmount: 15000000,
        totalSavedAmount: 3000000,
        overallProgressPercent: 20,
      },
      items: [
        {
          id: '1',
          title: 'Moto MT-03',
          category: 'vehicle',
          priority: 'high',
          status: 'active',
          targetAmount: 15000000,
          currentAmount: 3000000,
          remainingAmount: 12000000,
          progressPercent: 20,
          estimatedMonthsToComplete: 10,
          contributions: [],
        },
      ],
    });

    expect(store.loading()).toBe(false);
    expect(store.goals()).toHaveLength(1);
    expect(store.summary().overallProgressPercent).toBe(20);
  });
});

