import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from './auth.models';

const TOKEN_KEY = 'life_os_access_token';
const USER_KEY = 'life_os_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.getStoredToken());
  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly isAuthenticated = computed(
    () => !!this.token() && !!this.currentUser(),
  );

  init(): void {
    if (this.token()) {
      this.fetchProfile().subscribe({
        next: (user) => {
          this.currentUser.set(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        },
        error: () => {
          this.logout();
        },
      });
    }
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', payload).pipe(
      tap((res) => {
        this.saveSession(res.accessToken, res.user);
      }),
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((res) => {
        this.saveSession(res.accessToken, res.user);
      }),
    );
  }

  fetchProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/me');
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  private saveSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
