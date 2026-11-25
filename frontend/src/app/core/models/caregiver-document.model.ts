import { VerificationStatus } from './account-management.model';

export interface CaregiverCertificate {
  id: number;
  caregiver_id: number;
  document_type: string;
  document_name: string;
  document_url: string;
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
}

export interface DocumentVerificationUpdatePayload {
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
}

export interface DocumentVerificationUpdateResult {
  id: number;
  verification_status: VerificationStatus;
}