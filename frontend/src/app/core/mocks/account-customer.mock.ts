import { AccountOverviewItem, CareRecipientItem, UserAddressItem } from '../models';

export const MOCK_CUSTOMER_ACCOUNTS: AccountOverviewItem[] = [
  {
    id: 101,
    email: 'tran.van.minh@example.com',
    role: 'CUSTOMER',
    account_status: 'ACTIVE',
    email_verified: true,
    last_login_at: '2026-11-26T04:00:00.000Z',
    created_at: '2026-01-10T08:00:00.000Z',
    full_name: 'Trần Văn Minh',
    phone: '0901234567',
    recipients_count: 1,
  },
  {
    id: 102,
    email: 'nguyen.thi.lan@example.com',
    role: 'CUSTOMER',
    account_status: 'LOCKED',
    email_verified: true,
    last_login_at: '2026-11-20T09:30:00.000Z',
    created_at: '2026-02-15T07:15:00.000Z',
    full_name: 'Nguyễn Thị Lan',
    phone: '0912345678',
    recipients_count: 2,
  },
];

export const MOCK_CARE_RECIPIENTS: CareRecipientItem[] = [
  {
    id: 11,
    customer_id: 101,
    full_name: 'Trần Văn Cụ',
    relationship: 'Ông nội',
    date_of_birth: '1948-05-12',
    gender: 'MALE',
    medical_notes: 'Tăng huyết áp nhẹ, cần nhắc uống thuốc đúng giờ',
    emergency_contact_name: 'Trần Văn Minh',
    emergency_contact_phone: '0901234567',
  },
];

export const MOCK_USER_ADDRESSES: UserAddressItem[] = [
  {
    id: 501,
    user_id: 101,
    recipient_id: 11,
    address_name: 'Nhà riêng',
    detail_address: '123 Nguyễn Tất Thành',
    ward: 'Phường Quy Nhơn',
    district: null,
    province: 'Tỉnh Gia Lai',
    latitude: 13.7765,
    longitude: 109.2243,
    is_default: true,
  },
];