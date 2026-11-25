import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CaregiverAccounts } from './caregiver-accounts';
import { AccountsService } from '../accounts.service';
import { AccountOverviewItem } from '../../../../core/models/account-management.model';
import { CaregiverCertificate } from '../../../../core/models/caregiver-document.model';

describe('CaregiverAccounts', () => {
  let serviceMock: {
    getCaregiverDocuments: ReturnType<typeof vi.fn>;
    updateAccountStatus: ReturnType<typeof vi.fn>;
    updateDocumentVerificationStatus: ReturnType<typeof vi.fn>;
    deleteAccount: ReturnType<typeof vi.fn>;
  };

  const caregiver: AccountOverviewItem = {
    id: 202,
    role: 'CAREGIVER',
    email: 'nam@example.com',
    full_name: 'Phạm Hoàng Nam',
    phone: '0905000202',
    account_status: 'ACTIVE',
    email_verified: true,
    last_login_at: null,
    created_at: '2026-01-01T00:00:00Z',
    qualification: 'Điều dưỡng đa khoa',
    license_number: 'CCHN-001',
    experience_years: 3,
  };

  const docs: CaregiverCertificate[] = [
    {
      id: 3,
      caregiver_id: 202,
      document_type: 'DEGREE',
      document_name: 'Bằng Điều dưỡng đa khoa',
      document_url: 'https://example.com/1.pdf',
      verification_status: 'PENDING',
    },
    {
      id: 4,
      caregiver_id: 202,
      document_type: 'CERT',
      document_name: 'Chứng chỉ Chăm sóc người cao tuổi',
      document_url: 'https://example.com/2.pdf',
      verification_status: 'PENDING',
    },
  ];

  beforeEach(async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    serviceMock = {
      getCaregiverDocuments: vi.fn().mockReturnValue(of(docs)),
      updateAccountStatus: vi.fn().mockReturnValue(of({ id: 202, account_status: 'LOCKED' })),
      updateDocumentVerificationStatus: vi
        .fn()
        .mockImplementation((_, docId, status) => of({ id: docId, verification_status: status })),
      deleteAccount: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [CaregiverAccounts],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  it('should approve only the selected document and keep remaining document PENDING', () => {
    const fixture = TestBed.createComponent(CaregiverAccounts);
    fixture.componentRef.setInput('caregiver', caregiver);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.approveDoc(caregiver, docs[0]);

    expect(comp.documents()[0].verification_status).toBe('APPROVED');
    expect(comp.documents()[1].verification_status).toBe('PENDING');
  });

  it('should reject a pending document to REJECTED', () => {
    const fixture = TestBed.createComponent(CaregiverAccounts);
    fixture.componentRef.setInput('caregiver', caregiver);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.rejectDoc(caregiver, docs[1]);

    expect(comp.documents()[1].verification_status).toBe('REJECTED');
  });
});