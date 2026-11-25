export type UserRole = 'CUSTOMER' | 'CAREGIVER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthCredentialSummary {
  id: number;
  email: string;
  role: UserRole;
  account_status?: AccountStatus;
  email_verified?: boolean;
  last_login_at?: string | null;
}

export interface LoginData {
  token?: string;
  accessToken?: string;
  role?: UserRole;
  user?: AuthCredentialSummary;
}