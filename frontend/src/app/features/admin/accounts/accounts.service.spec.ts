import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AccountsService } from './accounts.service';
import { AccountOverviewItem } from '../../../core/models/account-management.model';
import { CaregiverCertificate } from '../../../core/models/caregiver-document.model';

describe('AccountsService', () => {
  let service: AccountsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AccountsService],
    });
    service = TestBed.inject(AccountsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAccounts gửi đúng query params và bóc dữ liệu từ ApiResponse', () => {
    const mockApiItem: AccountOverviewItem = {
      id: 101,
      full_name: 'Trần Văn Minh',
      email: 'minh@homecare.vn',
      phone: '0901234567',
      role: 'CUSTOMER',
      account_status: 'ACTIVE',
    } as AccountOverviewItem;

    let result: AccountOverviewItem[] = [];
    service
      .getAccounts({ role: 'CUSTOMER', search: '  Minh  ', status: 'ACTIVE' })
      .subscribe((data) => (result = data));

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/admin/accounts' &&
        r.params.get('role') === 'CUSTOMER' &&
        r.params.get('search') === 'Minh' &&
        r.params.get('status') === 'ACTIVE'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockApiItem] });

    expect(result).toEqual([mockApiItem]);
  });

  it('getAccounts rơi về local fallback khi HTTP lỗi', () => {
    let result: AccountOverviewItem[] = [];
    service
      .getAccounts({ role: 'CAREGIVER', search: '', status: 'ALL' })
      .subscribe((data) => (result = data));

    const req = httpMock.expectOne(
      (r) => r.url === '/api/admin/accounts' && r.params.get('role') === 'CAREGIVER'
    );
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.role === 'CAREGIVER')).toBe(true);
  });

  it('updateAccountStatus gọi PATCH đúng endpoint và payload', () => {
    let updatedStatus: string | undefined;
    service.updateAccountStatus(101, 'LOCKED').subscribe((res) => {
      updatedStatus = res.account_status;
    });

    const req = httpMock.expectOne('/api/admin/accounts/101/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ account_status: 'LOCKED' });
    req.flush({ success: true, data: { id: 101, account_status: 'LOCKED' } });

    expect(updatedStatus).toBe('LOCKED');
  });

  it('getCaregiverDocuments gọi đúng URL của nhân viên', () => {
    const docs: CaregiverCertificate[] = [];
    let received: CaregiverCertificate[] = [];

    service.getCaregiverDocuments(201).subscribe((data) => (received = data));

    const req = httpMock.expectOne('/api/admin/caregivers/201/documents');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: docs });

    expect(received).toEqual(docs);
  });

  it('updateDocumentVerificationStatus gửi payload duyệt/từ chối đúng endpoint', () => {
    let statusRes: string | undefined;
    const reason = 'Giấy tờ chưa rõ thông tin hoặc chưa khớp hồ sơ';

    service
      .updateDocumentVerificationStatus(201, 11, 'REJECTED', reason)
      .subscribe((res) => (statusRes = res.verification_status));

    const req = httpMock.expectOne('/api/admin/caregivers/201/documents/11/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      verification_status: 'REJECTED',
      rejection_reason: reason,
    });
    req.flush({ success: true, data: { id: 11, verification_status: 'REJECTED' } });

    expect(statusRes).toBe('REJECTED');
  });
});