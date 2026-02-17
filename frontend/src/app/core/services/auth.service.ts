import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';

  private currentUser = signal<UserResponse | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(fullName: string, email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/register', { fullName, email, password })
      .pipe(tap(res => this.storeTokens(res.data)));
  }

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password })
      .pipe(tap(res => this.storeTokens(res.data)));
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/refresh', { refreshToken })
      .pipe(tap(res => this.storeTokens(res.data)));
  }

  loadCurrentUser(): void {
    if (this.getToken()) {
      this.http.get<ApiResponse<UserResponse>>('/api/auth/me').subscribe({
        next: res => this.currentUser.set(res.data),
        error: () => this.logout()
      });
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeTokens(auth: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, auth.accessToken);
    localStorage.setItem(this.REFRESH_KEY, auth.refreshToken);
  }
}
