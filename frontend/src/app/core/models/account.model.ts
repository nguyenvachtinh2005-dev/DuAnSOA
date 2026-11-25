import { AccountStatus, UserRole } from './auth.model';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface AdminProfile {
  user_id: number;
  full_name: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  avatar_url?: string | null;
  email?: string;
  role?: UserRole;
  account_status?: AccountStatus;
}