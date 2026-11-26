import {
  AccountOverviewItem,
  CaregiverCertificate,
  CaregiverProfileDetail,
} from '../models';

export const MOCK_CAREGIVER_ACCOUNTS: AccountOverviewItem[] = [
  {
    id: 201,
    email: 'le.hoang.nam@example.com',
    role: 'CAREGIVER',
    account_status: 'ACTIVE',
    email_verified: true,
    last_login_at: '2026-11-26T03:20:00.000Z',
    created_at: '2026-03-01T10:00:00.000Z',
    full_name: 'Lê Hoàng Nam',
    phone: '0987654321',
    qualification: 'Điều dưỡng đa khoa',
    experience_years: 4,
    license_number: 'CCHN-00123',
    verification_status: 'APPROVED',
  },
];

export const MOCK_CAREGIVER_PROFILES: CaregiverProfileDetail[] = [
  {
    id: 301,
    user_id: 201,
    introduction: 'Có kinh nghiệm chăm sóc người cao tuổi và phục hồi chức năng tại nhà.',
    qualification: 'Điều dưỡng đa khoa',
    experience_years: 4,
    license_number: 'CCHN-00123',
    verification_status: 'APPROVED',
    rejection_reason: null,
    approved_by: 1,
    approved_at: '2026-03-05T12:00:00.000Z',
  },
];

export const MOCK_CAREGIVER_DOCUMENTS: CaregiverCertificate[] = [
  {
    id: 701,
    caregiver_id: 301,
    document_type: 'LICENSE',
    document_name: 'Chứng chỉ hành nghề điều dưỡng',
    document_url: 'https://example.com/docs/cchn-00123.pdf',
    verification_status: 'APPROVED',
    rejection_reason: null,
  },
];