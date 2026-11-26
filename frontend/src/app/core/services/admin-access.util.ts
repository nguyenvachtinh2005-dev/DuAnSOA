export interface TokenClaims {
  sub?: string | number;
  id?: number;
  userId?: number;
  role?: 'CUSTOMER' | 'CAREGIVER' | 'ADMIN' | string;
  exp?: number;
}

const ADMIN_TOKEN_KEY = 'soa_admin_token';
const ADMIN_ROLE_KEY = 'soa_admin_role';

export function decodeJwtPayload(token: string | null): TokenClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return (
    localStorage.getItem(ADMIN_TOKEN_KEY) ??
    localStorage.getItem('access_token') ??
    localStorage.getItem('token') ??
    sessionStorage.getItem('access_token') ??
    null
  );
}

export function assertAdminToken(): TokenClaims {
  const token = getAccessToken();
  if (!token || token.trim().length === 0) {
    throw new Error('Thiếu token xác thực. Vui lòng đăng nhập tài khoản ADMIN.');
  }

  const claims = decodeJwtPayload(token) ?? {};

  if (typeof claims.exp === 'number' && Date.now() >= claims.exp * 1000) {
    throw new Error('Phiên đăng nhập đã hết hạn.');
  }

  const storedRole = localStorage.getItem(ADMIN_ROLE_KEY)?.toUpperCase();
  const effectiveRole = (claims.role ?? storedRole)?.toUpperCase();

  if (effectiveRole !== 'ADMIN') {
    throw new Error('Chỉ tài khoản có quyền ADMIN mới được thực hiện thao tác này.');
  }

  return {
    ...claims,
    role: effectiveRole,
  };
}