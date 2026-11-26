import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginData, LoginRequest } from '../models/auth.model';
import { ApiResponse } from '../models/api.model';
import { decodeJwtPayload } from './admin-access.util';

export type LoginApiResult = LoginData | ApiResponse<LoginData>;

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);

  // Đi qua API Gateway (đổi sang '/api/gateway/auth' hoặc base URL gateway nếu cần)
  private readonly apiUrl = '/api/auth';
  private readonly tokenKey = 'soa_admin_token';
  private readonly roleKey = 'soa_admin_role';

  login(payload: LoginRequest): Observable<LoginApiResult> {
    return this.http.post<LoginApiResult>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        const data = this.extractLoginData(res);
        const token = data?.token ?? data?.accessToken;
        const role = data?.role ?? data?.user?.role;
        if (token) {
          this.setSession(token, role);
        }
      })
    );
  }

  setSession(token: string, role?: string): void {
    localStorage.setItem(this.tokenKey, token);
    if (role) {
      localStorage.setItem(this.roleKey, role.toUpperCase());
    } else {
      localStorage.removeItem(this.roleKey);
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
    const storedRole = this.getRole()?.toUpperCase();

    if (!token || token.trim().length === 0) {
      this.logout();
      return false;
    }

    const claims = decodeJwtPayload(token);
    if (!claims) {
      this.logout();
      return false;
    }

    if (typeof claims.exp === 'number' && Date.now() >= claims.exp * 1000) {
      this.logout();
      return false;
    }

    const effectiveRole = (claims.role ?? storedRole)?.toUpperCase();
    if (effectiveRole !== 'ADMIN') {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }
}