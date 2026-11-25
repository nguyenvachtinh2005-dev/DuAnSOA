import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginData, LoginRequest } from '../models/auth.model';
import { ApiResponse } from '../models/api.model';

export type LoginApiResult = LoginData | ApiResponse<LoginData>;

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  // Port 3001 theo Authentication Service trong soa_homecare_db (hoặc đổi sang URL gateway)
  private readonly apiUrl = 'http://localhost:3001/api/auth';
  private readonly tokenKey = 'soa_admin_token';
  private readonly roleKey = 'soa_admin_role';

  login(payload: LoginRequest): Observable<LoginApiResult> {
    return this.http.post<LoginApiResult>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        const data = this.extractLoginData(res);
        const token = data?.token ?? data?.accessToken;
        if (token) {
          localStorage.setItem(this.tokenKey, token);
        }
      })
    );
  }

  setSession(token: string, role?: string): void {
    localStorage.setItem(this.tokenKey, token);
    if (role) {
      localStorage.setItem(this.roleKey, role.toUpperCase());
    }
  }

  extractLoginData(res: LoginApiResult): LoginData {
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as LoginData;
  }

  extractMessage(res: LoginApiResult): string | undefined {
    if (res && 'message' in res && typeof res.message === 'string') {
      return res.message;
    }
    return undefined;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAdminAuthenticated(): boolean {
    const token = this.getToken();
    const role = this.getRole();
    return Boolean(token && token.trim().length > 0 && role === 'ADMIN');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }
}