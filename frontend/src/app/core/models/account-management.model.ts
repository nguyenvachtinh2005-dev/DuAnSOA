export type AccountRole = 'CUSTOMER' | 'CAREGIVER';
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccountOverviewItem {
  id: number;
  email: string;
  role: 'CUSTOMER' | 'CAREGIVER' | 'ADMIN';
  account_status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  full_name: string;
  phone: string | null;
  date_of_birth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  avatar_url?: string | null;
  recipients_count?: number;
  qualification?: string | null;
  experience_years?: number | null;
  license_number?: string | null;
  verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export interface AccountModeOption {
  role: AccountRole;
  label: string;
  shortLabel: string;
  description: string;
  badgeText: string;
}

export interface AccountQueryFilter {
  role: AccountRole;
  search?: string;
  status?: AccountStatus | 'ALL';
}

export interface AccountStatusUpdateResult {
  id: number;
  account_status: AccountStatus;
}
export type CreateCareRecipientPayload = Omit<CareRecipientItem, 'id'>;

export type UpdateCareRecipientPayload = Partial<
  Omit<CareRecipientItem, 'id' | 'customer_id'>
>;

export type UpdateAccountProfilePayload = Partial<
  Pick<
    AccountOverviewItem,
    'full_name' | 'phone' | 'date_of_birth' | 'gender' | 'avatar_url'
  >
>;
export interface CareRecipientItem {
  id: number;
  customer_id: number;
  full_name: string;
  relationship: string;
  date_of_birth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  medical_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

export interface CustomerProfileUpdatePayload {
  full_name: string;
  email: string;
  phone: string | null;
}