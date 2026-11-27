import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_STORAGE_KEY = 'soa_admin_token';
const ROLE_STORAGE_KEY = 'soa_admin_role';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const isGatewayRequest =
    req.url.startsWith('http://localhost:3000/api') ||
    req.url.startsWith('/api/');

  const isPublicAuthEndpoint =
    req.url.endsWith('/api/auth/login') ||
    req.url.endsWith('/api/auth/register');

  if (!isGatewayRequest || isPublicAuthEndpoint) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(ROLE_STORAGE_KEY);
        void router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};