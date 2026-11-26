// @vitest-environment jsdom
import { TestBed, getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AccountsService } from './accounts.service';
import {
  MOCK_CAREGIVER_ACCOUNTS,
  MOCK_CAREGIVER_DOCUMENTS,
  MOCK_CAREGIVER_PROFILES,
  MOCK_CARE_RECIPIENTS,
  MOCK_CUSTOMER_ACCOUNTS,
  MOCK_USER_ADDRESSES,
  setMockToken,
  wrapApiResponse,
} from '../../mocks';
import {
  AccountOverviewItem,
  CareRecipientItem,
  CaregiverCertificate,
  CaregiverProfileDetail,
  CreateCareRecipientPayload,
  UpdateAccountProfilePayload,
  UpdateCareRecipientPayload,
  UpdateCaregiverProfilePayload,
  UserAddressItem,
} from '../../models';

describe('AccountsService', () => {
  let service: AccountsService;
  let httpMock: HttpTestingController;

  const gatewayUrl = '/api/gateway';
  const authAdminUrl = `${gatewayUrl}/auth/admin/accounts`;
  const accountAdminUrl = `${gatewayUrl}/accounts/admin`;
  const caregiverAdminUrl = `${gatewayUrl}/caregivers/admin`;

  beforeAll(() => {
    const testBed = getTestBed();
    if (!testBed.platform) {
      testBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
        teardown: { destroyAfterEach: true },
      });
    }
  });

  afterAll(() => {
    getTestBed().resetTestEnvironment();
  });

  beforeEach(() => {
    setMockToken();

    TestBed.configureTestingModule({
      providers: [
        AccountsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AccountsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
    setMockToken(null);
  });

  it('should block requests when admin token is missing', () => {
    setMockToken(null);

    let errorMessage = '';
    service.getAccounts({ role: 'CUSTOMER' }).subscribe({
      next: () => {
        throw new Error('Expected error when missing admin token');
      },
      error: (err: unknown) => {
        errorMessage = err instanceof Error ? err.message : String(err);
      },
    });

    expect(errorMessage).toBeTruthy();
    httpMock.expectNone(authAdminUrl);
  });

  it('should get accounts filtered by role, search and status (user_credentials & user_profiles)', () => {
    const expected: AccountOverviewItem[] = [MOCK_CUSTOMER_ACCOUNTS[0]];

    service
      .getAccounts({ role: 'CUSTOMER', search: 'Minh', status: 'ACTIVE' })
      .subscribe((items) => {
        expect(items).toEqual(expected);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === authAdminUrl &&
        r.params.get('role') === 'CUSTOMER' &&
        r.params.get('search') === 'Minh' &&
        r.params.get('status') === 'ACTIVE'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer\s+/);
    req.flush(wrapApiResponse(expected));
  });

  it('should omit status param when status is ALL or empty search', () => {
    service.getAccounts({ role: 'CUSTOMER', search: '   ', status: 'ALL' }).subscribe((items) => {
      expect(items).toEqual(MOCK_CUSTOMER_ACCOUNTS);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === authAdminUrl &&
        r.params.get('role') === 'CUSTOMER' &&
        !r.params.has('search') &&
        !r.params.has('status')
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_CUSTOMER_ACCOUNTS);
  });

  it('should update account_status on user_credentials via PATCH', () => {
    const updated = { id: 102, account_status: 'ACTIVE' as const };

    service.updateAccountStatus(102, 'ACTIVE').subscribe((res) => {
      expect(res).toEqual(updated);
    });

    const req = httpMock.expectOne(`${authAdminUrl}/102/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ account_status: 'ACTIVE' });
    req.flush(wrapApiResponse(updated));
  });

  it('should delete account via DELETE', () => {
    let completed = false;

    service.deleteAccount(102).subscribe({
      next: () => {
        completed = true;
      },
    });

    const req = httpMock.expectOne(`${authAdminUrl}/102`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrapApiResponse(null));
    expect(completed).toBe(true);
  });

  it('should update user_profiles fields (full_name, phone, date_of_birth, gender, avatar_url)', () => {
    const payload: UpdateAccountProfilePayload = {
      full_name: 'Trần Văn Minh (Cập nhật)',
      phone: '0901234567',
      date_of_birth: '1990-04-20',
      gender: 'MALE',
      avatar_url: 'https://example.com/avatars/101.png',
    };
    const expected: AccountOverviewItem = {
      ...MOCK_CUSTOMER_ACCOUNTS[0],
      ...payload,
    };

    service.updateUserProfile(101, payload).subscribe((res) => {
      expect(res).toEqual(expected);
    });

    const req = httpMock.expectOne(`${accountAdminUrl}/users/101/profile`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(wrapApiResponse(expected));
  });

  it('should CRUD care_recipients for a customer_id', () => {
    // 1. GET list
    service.getCustomerRecipients(101).subscribe((list: CareRecipientItem[]) => {
      expect(list).toEqual(MOCK_CARE_RECIPIENTS);
    });
    const getReq = httpMock.expectOne(`${accountAdminUrl}/customers/101/recipients`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(wrapApiResponse(MOCK_CARE_RECIPIENTS));

    // 2. POST create
    const createPayload: CreateCareRecipientPayload = {
      customer_id: 101,
      full_name: 'Trần Thị Mai',
      relationship: 'Mẹ',
      date_of_birth: '1962-08-15',
      gender: 'FEMALE',
      medical_notes: 'Theo dõi đường huyết định kỳ',
      emergency_contact_name: 'Trần Văn Minh',
      emergency_contact_phone: '0901234567',
    };
    const createdRecipient: CareRecipientItem = {
      id: 12,
      ...createPayload,
    };

    service.addCustomerRecipient(101, createPayload).subscribe((res) => {
      expect(res).toEqual(createdRecipient);
    });
    const postReq = httpMock.expectOne(`${accountAdminUrl}/customers/101/recipients`);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ ...createPayload, customer_id: 101 });
    postReq.flush(wrapApiResponse(createdRecipient));

    // 3. PATCH update
    const updatePayload: UpdateCareRecipientPayload = {
      medical_notes: 'Đã ổn định huyết áp',
    };
    const updatedRecipient: CareRecipientItem = {
      ...MOCK_CARE_RECIPIENTS[0],
      ...updatePayload,
    };

    service.updateCustomerRecipient(101, 11, updatePayload).subscribe((res) => {
      expect(res).toEqual(updatedRecipient);
    });
    const patchReq = httpMock.expectOne(`${accountAdminUrl}/customers/101/recipients/11`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual(updatePayload);
    patchReq.flush(wrapApiResponse(updatedRecipient));

    // 4. DELETE recipient
    let deleted = false;
    service.deleteCustomerRecipient(101, 11).subscribe({
      next: () => {
        deleted = true;
      },
    });
    const delReq = httpMock.expectOne(`${accountAdminUrl}/customers/101/recipients/11`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush(wrapApiResponse(null));
    expect(deleted).toBe(true);
  });

  it('should get user_addresses by user_id', () => {
    service.getUserAddresses(101).subscribe((list: UserAddressItem[]) => {
      expect(list).toEqual(MOCK_USER_ADDRESSES);
    });

    const req = httpMock.expectOne(`${accountAdminUrl}/users/101/addresses`);
    expect(req.request.method).toBe('GET');
    req.flush(wrapApiResponse(MOCK_USER_ADDRESSES));
  });

  it('should get and update caregiver_profiles and caregiver_documents verification_status', () => {
    const caregiverUserId = MOCK_CAREGIVER_ACCOUNTS[0].id;
    const caregiverProfile = MOCK_CAREGIVER_PROFILES[0];

    // 1. GET caregiver profile by user_id
    service.getCaregiverProfile(caregiverUserId).subscribe((profile: CaregiverProfileDetail) => {
      expect(profile).toEqual(caregiverProfile);
    });
    const getProfReq = httpMock.expectOne(
      `${caregiverAdminUrl}/users/${caregiverUserId}/profile`
    );
    expect(getProfReq.request.method).toBe('GET');
    getProfReq.flush(wrapApiResponse(caregiverProfile));

    // 2. PATCH caregiver profile by caregiver_id
    const profilePatch: UpdateCaregiverProfilePayload = {
      experience_years: 5,
      verification_status: 'APPROVED',
      rejection_reason: null,
    };
    const updatedProfile: CaregiverProfileDetail = {
      ...caregiverProfile,
      ...profilePatch,
    };

    service.updateCaregiverProfile(caregiverProfile.id, profilePatch).subscribe((res) => {
      expect(res).toEqual(updatedProfile);
    });
    const patchProfReq = httpMock.expectOne(
      `${caregiverAdminUrl}/${caregiverProfile.id}/profile`
    );
    expect(patchProfReq.request.method).toBe('PATCH');
    expect(patchProfReq.request.body).toEqual(profilePatch);
    patchProfReq.flush(wrapApiResponse(updatedProfile));

    // 3. GET caregiver documents by caregiver_id
    service
      .getCaregiverDocuments(caregiverProfile.id)
      .subscribe((docs: CaregiverCertificate[]) => {
        expect(docs).toEqual(MOCK_CAREGIVER_DOCUMENTS);
      });
    const getDocsReq = httpMock.expectOne(
      `${caregiverAdminUrl}/${caregiverProfile.id}/documents`
    );
    expect(getDocsReq.request.method).toBe('GET');
    getDocsReq.flush(wrapApiResponse(MOCK_CAREGIVER_DOCUMENTS));

    // 4. PATCH document verification_status
    const docId = MOCK_CAREGIVER_DOCUMENTS[0].id;
    const statusResult = {
      id: docId,
      caregiver_id: caregiverProfile.id,
      verification_status: 'REJECTED' as const,
      rejection_reason: 'Ảnh chứng chỉ bị mờ',
    };

    service
      .updateDocumentVerificationStatus(
        caregiverProfile.id,
        docId,
        'REJECTED',
        'Ảnh chứng chỉ bị mờ'
      )
      .subscribe((res) => {
        expect(res).toEqual(statusResult);
      });
    const patchDocReq = httpMock.expectOne(
      `${caregiverAdminUrl}/${caregiverProfile.id}/documents/${docId}/status`
    );
    expect(patchDocReq.request.method).toBe('PATCH');
    expect(patchDocReq.request.body).toEqual({
      verification_status: 'REJECTED',
      rejection_reason: 'Ảnh chứng chỉ bị mờ',
    });
    patchDocReq.flush(wrapApiResponse(statusResult));
  });
});