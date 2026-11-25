import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { AccountsService } from './accounts.service';
import { MOCK_ACCOUNTS, MOCK_CAREGIVER_CERTIFICATES } from './accounts.mock';

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

  it('should filter local fallback accounts by role, search and status on HTTP error', () => {
    service
      .getAccounts({ role: 'CUSTOMER', search: 'Minh', status: 'ACTIVE' })
      .subscribe((list) => {
        expect(list.length).toBeGreaterThanOrEqual(1);
        expect(list.every((item) => item.role === 'CUSTOMER')).toBe(true);
      });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/admin/accounts' && r.params.get('role') === 'CUSTOMER'
    );
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should sync mock certificate status when updating document verification status', () => {
    const sampleDoc = MOCK_CAREGIVER_CERTIFICATES[0];
    const originalStatus = sampleDoc.verification_status;

    service
      .updateDocumentVerificationStatus(sampleDoc.caregiver_id, sampleDoc.id, 'APPROVED')
      .subscribe((res) => {
        expect(res.verification_status).toBe('APPROVED');
      });

    const req = httpMock.expectOne(
      `/api/admin/caregivers/${sampleDoc.caregiver_id}/documents/${sampleDoc.id}/status`
    );
    req.flush('Offline', { status: 503, statusText: 'Service Unavailable' });

    service.getCaregiverDocuments(sampleDoc.caregiver_id).subscribe((docs) => {
      const updated = docs.find((d) => d.id === sampleDoc.id);
      expect(updated?.verification_status).toBe('APPROVED');
    });

    const docReq = httpMock.expectOne(
      `/api/admin/caregivers/${sampleDoc.caregiver_id}/documents`
    );
    docReq.flush('Offline', { status: 503, statusText: 'Service Unavailable' });

    sampleDoc.verification_status = originalStatus;
  });

  it('should return fallback recipients for customer 101 and empty list for unknown customer', () => {
    service.getCustomerRecipients(101).subscribe((list) => {
      expect(list.length).toBe(2);
      expect(list[0].full_name).toBe('Trần Văn An');
    });
    const req101 = httpMock.expectOne('/api/admin/accounts/101/recipients');
    req101.flush('Error', { status: 404, statusText: 'Not Found' });

    service.getCustomerRecipients(999).subscribe((list) => {
      expect(list).toEqual([]);
    });
    const req999 = httpMock.expectOne('/api/admin/accounts/999/recipients');
    req999.flush('Error', { status: 404, statusText: 'Not Found' });
  });

  it('should handle deleteAccount fallback cleanly', () => {
    expect(MOCK_ACCOUNTS.length).toBeGreaterThan(0);
    service.deleteAccount(102).subscribe((res) => {
      expect(res).toBeUndefined();
    });
    const req = httpMock.expectOne('/api/admin/accounts/102');
    req.flush('Error', { status: 500, statusText: 'Error' });
  });
});