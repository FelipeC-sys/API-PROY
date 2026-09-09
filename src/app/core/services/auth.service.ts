import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest } from '../models/auth.model';
import { Role, User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'helpdesk_access_token';
const REFRESH_TOKEN_KEY = 'helpdesk_refresh_token';
const USER_KEY = 'helpdesk_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly currentUserSignal = signal<User | null>(this.readUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly role = computed<Role | null>(() => this.currentUserSignal()?.role ?? null);

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload);
  }

  refreshAccessToken(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken });
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<void>(`${environment.apiUrl}/auth/logout`, { refreshToken })
      .pipe(tap(() => this.clearSession()));
  }

  setSession(res: AuthResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUserSignal.set(res.user);
  }

  clearSession(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  }

  updateAccessToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  private readUser(): User | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
