import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('lifeos-lang');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(I18nService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads Spanish dictionary and interpolates params', async () => {
    const initPromise = service.init();
    const req = httpMock.expectOne('/i18n/es.json');
    req.flush({
      goals: {
        card: {
          manyMonths: '~{{count}} meses',
        },
      },
    });
    await initPromise;

    expect(service.lang()).toBe('es');
    expect(service.t('goals.card.manyMonths', { count: 10 })).toBe('~10 meses');
  });

  it('switches to English JSON dictionary', async () => {
    const switchPromise = service.setLanguage('en');
    const req = httpMock.expectOne('/i18n/en.json');
    req.flush({
      nav: {
        goals: 'Goals',
      },
    });
    await switchPromise;

    expect(service.lang()).toBe('en');
    expect(service.t('nav.goals')).toBe('Goals');
  });
});

