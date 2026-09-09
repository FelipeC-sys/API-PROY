import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  isRefreshing = false;
  readonly accessToken$ = new BehaviorSubject<string | null>(null);
}
