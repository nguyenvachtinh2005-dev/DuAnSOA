import { VerificationStatus } from './account-management.model';

export interface CaregiverProfileDetail {
  id: number;
  user_id: number;
  introduction: string | null;
  qualification: string | null;
  experience_years: number;
  license_number: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  approved_by: number | null;
  approved_at: string | null;
}

export type UpdateCaregiverProfilePayload = Partial<
  Pick<
    CaregiverProfileDetail,
    | 'introduction'
    | 'qualification'
    | 'experience_years'
    | 'license_number'
    | 'verification_status'
    | 'rejection_reason'
  >
>;