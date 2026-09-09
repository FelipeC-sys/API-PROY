import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenRefreshService } from '../services/token-refresh.service';

const REFRESH_ENDPOINT = '/auth/refresh';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenRefreshService = inject(TokenRefreshService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isHttpError = error instanceof HttpErrorResponse;
      const isTokenExpired = isHttpError && error.status === 401 && error.error?.error?.code === 'TOKEN_EXPIRED';
      const isRefreshCall = req.url.includes(REFRESH_ENDPOINT);

      if (!isTokenExpired || isRefreshCall) {
        return throwError(() => error);
      }

      return handleExpiredToken(req, next, authService, tokenRefreshService, router);
    })
  );
};

function handleExpiredToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenRefreshService: TokenRefreshService,
  router: Router
) {
  if (!tokenRefreshService.isRefreshing) {
    tokenRefreshService.isRefreshing = true;
    tokenRefreshService.accessToken$.next(null);

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      return forceLogout(authService, router);
    }

    return authService.refreshAccessToken(refreshToken).pipe(
      switchMap((res) => {
        tokenRefreshService.isRefreshing = false;
        authService.updateAccessToken(res.accessToken);
        tokenRefreshService.accessToken$.next(res.accessToken);
        return next(addToken(req, res.accessToken));
      }),
      catchError(() => forceLogout(authService, router))
    );
  }

  return tokenRefreshService.accessToken$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token)))
  );
}

function addToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function forceLogout(authService: AuthService, router: Router) {
  authService.clearSession();
  router.navigateByUrl('/login');
  return throwError(() => new Error('Sesion expirada, inicia sesion de nuevo.'));
}
