import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { CaregiverAccounts } from './caregiver-accounts';
import { AccountsService } from '../accounts.service';
import { AccountOverviewItem } from '../../../../core/models/account-management.model';
import { CaregiverCertificate } from '../../../../core/models/caregiver-document.model';

describe('CaregiverAccounts', () => {
  const sampleCaregivers: AccountOverviewItem[] = [
    {
      id: 201,
      full_name: 'Lê Thị Hoa',
      email: 'dieu.duong.hoa@homecare.vn',
      phone: '0983111222',
      role: 'CAREGIVER',
      account_status: 'ACTIVE',
      license_number: 'CCHN-004821',
    } as AccountOverviewItem,
    {
      id: 202,
      full_name: 'Phạm Hoàng Nam',
      email: 'dieu.duong.nam@homecare.vn',
      phone: '0977333444',
      role: 'CAREGIVER',
      account_status: 'PENDING',
      license_number: 'CCHN-009102',
    } as AccountOverviewItem,
  ];

  const sampleCerts: CaregiverCertificate[] = [
    {
      id: 11,
      caregiver_id: 201,
      document_type: 'LICENSE',
      document_name: 'Chứng chỉ hành nghề điều dưỡng',
      document_url: 'https://example.com/cchn.pdf',
      verification_status: 'PENDING',
      rejection_reason: null,
    } as CaregiverCertificate,
  ];

  const serviceMock = {
    getAccounts: vi.fn(),
    getCaregiverDocuments: vi.fn(),
    updateDocumentVerificationStatus: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    serviceMock.getAccounts.mockReturnValue(of(sampleCaregivers));
    serviceMock.getCaregiverDocuments.mockReturnValue(of(sampleCerts));
    serviceMock.updateDocumentVerificationStatus.mockImplementation((_cId, docId, status) =>
      of({ id: docId, verification_status: status })
    );

    await TestBed.configureTestingModule({
      imports: [CaregiverAccounts],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  it('tải danh sách nhân viên và lọc theo từ khóa / trạng thái', () => {
    const fixture = TestBed.createComponent(CaregiverAccounts);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    expect(comp.filteredCaregivers().length).toBe(2);

    comp.searchQuery.set('CCHN-009102');
    expect(comp.filteredCaregivers().map((c) => c.id)).toEqual([202]);

    comp.searchQuery.set('');
    comp.statusFilter.set('ACTIVE');
    expect(comp.filteredCaregivers().map((c) => c.id)).toEqual([201]);
  });

  it('mở popup chứng chỉ, cập nhật trạng thái duyệt/từ chối và đóng popup', () => {
    const fixture = TestBed.createComponent(CaregiverAccounts);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.openCertificatesPopup(sampleCaregivers[0]);
    expect(comp.selectedCaregiver()?.id).toBe(201);
    expect(serviceMock.getCaregiverDocuments).toHaveBeenCalledWith(201);
    expect(comp.certificates().length).toBe(1);

    comp.updateCertificateStatus(11, 'APPROVED');
    expect(comp.certificates()[0].verification_status).toBe('APPROVED');
    expect(comp.certificates()[0].rejection_reason).toBeNull();

    comp.updateCertificateStatus(11, 'REJECTED');
    expect(comp.certificates()[0].verification_status).toBe('REJECTED');
    expect(comp.certificates()[0].rejection_reason).toBeTruthy();

    comp.closeCertificatesPopup();
    expect(comp.selectedCaregiver()).toBeNull();
    expect(comp.certificates()).toEqual([]);
  });
});