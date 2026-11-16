import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

export type SupportedLang = 'es' | 'en';

type TranslationDict = Record<string, unknown>;

const STORAGE_KEY = 'lifeos-lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly cache = new Map<SupportedLang, TranslationDict>();

  readonly lang = signal<SupportedLang>(this.readInitialLang());
  readonly dictionary = signal<TranslationDict>({});

  async init(): Promise<void> {
    await this.loadLanguage(this.lang());
  }

  async setLanguage(lang: SupportedLang): Promise<void> {
    if (this.lang() === lang && this.cache.has(lang)) {
      return;
    }
    this.lang.set(lang);
    this.persistLang(lang);
    this.document.documentElement.lang = lang;
    await this.loadLanguage(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dict = this.dictionary();
    const resolved = this.resolveKey(dict, key);
    if (typeof resolved !== 'string') {
      return key;
    }
    if (!params) {
      return resolved;
    }
    return resolved.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token: string) =>
      token in params ? String(params[token]) : '',
    );
  }

  private async loadLanguage(lang: SupportedLang): Promise<void> {
    const cached = this.cache.get(lang);
    if (cached) {
      this.dictionary.set(cached);
      return;
    }

    const loaded = await firstValueFrom(
      this.http
        .get<TranslationDict>(`/i18n/${lang}.json`)
        .pipe(catchError(() => of({} as TranslationDict))),
    );

    this.cache.set(lang, loaded);
    if (this.lang() === lang) {
      this.dictionary.set(loaded);
    }
  }

  private resolveKey(dict: TranslationDict, path: string): unknown {
    let current: unknown = dict;
    for (const segment of path.split('.')) {
      if (
        typeof current === 'object' &&
        current !== null &&
        segment in current
      ) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private readInitialLang(): SupportedLang {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') {
        this.document.documentElement.lang = saved;
        return saved;
      }
    }
    this.document.documentElement.lang = 'es';
    return 'es';
  }

  private persistLang(lang: SupportedLang): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }
}

