import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// On Android emulator, host machine's localhost is 10.0.2.2
const API_HOST = Capacitor.isNativePlatform() ? 'http://10.0.2.2:3000' : '';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  const isAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register');

  let updatedUrl = req.url;
  if (req.url.startsWith('/api') && API_HOST) {
    updatedUrl = `${API_HOST}${req.url}`;
  }

  const headers: Record<string, string> = {};
  if (token && !isAuthEndpoint && req.url.includes('/api')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestToForward = req.clone({
    url: updatedUrl,
    setHeaders: headers,
  });

  return next(requestToForward).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
