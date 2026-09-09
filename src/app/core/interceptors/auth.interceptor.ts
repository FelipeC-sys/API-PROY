import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
  const token = authService.getAccessToken();

  if (!token || isPublicEndpoint) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};
