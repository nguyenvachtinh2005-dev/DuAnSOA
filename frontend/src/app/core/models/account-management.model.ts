export type AccountRole = 'CUSTOMER' | 'CAREGIVER';
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccountOverviewItem {
  id: number;
  email: string;
  role: AccountRole;
  account_status: AccountStatus;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  full_name: string;
  phone: string | null;
  // Riêng cho nhân viên chăm sóc y tế (caregiver_profiles)
  qualification?: string | null;
  experience_years?: number;
  license_number?: string | null;
  verification_status?: VerificationStatus;
  // Riêng cho khách hàng (care_recipients)
  recipients_count?: number;
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