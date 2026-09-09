import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const currentRole = authService.role();

  if (!allowedRoles || allowedRoles.length === 0 || (currentRole && allowedRoles.includes(currentRole))) {
    return true;
  }

  return router.parseUrl('/');
};
