import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CaregiverAccounts } from './caregiver-accounts';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';
import { AccountOverviewItem, CaregiverCertificate } from '../../../../core/models';

describe('CaregiverAccounts', () => {
  let serviceMock: {
    getCaregiverProfile: ReturnType<typeof vi.fn>;
    getCaregiverDocuments: ReturnType<typeof vi.fn>;
    updateUserProfile: ReturnType<typeof vi.fn>;
    updateCaregiverProfile: ReturnType<typeof vi.fn>;
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
    vi.spyOn(window, 'prompt').mockReturnValue('Hồ sơ chưa đạt yêu cầu');

    serviceMock = {
      getCaregiverProfile: vi.fn().mockReturnValue(
        of({
          id: 202,
          user_id: 202,
          introduction: null,
          qualification: 'Điều dưỡng đa khoa',
          experience_years: 3,
          license_number: 'CCHN-001',
          verification_status: 'PENDING',
          rejection_reason: null,
          approved_by: null,
          approved_at: null,
        })
      ),
      getCaregiverDocuments: vi.fn().mockReturnValue(of(docs)),
      updateUserProfile: vi.fn().mockReturnValue(of(caregiver)),
      updateCaregiverProfile: vi.fn().mockReturnValue(
        of({
          id: 202,
          user_id: 202,
          introduction: 'Giới thiệu mới',
          qualification: 'Điều dưỡng đa khoa',
          experience_years: 5,
          license_number: 'CCHN-001',
          verification_status: 'APPROVED',
          rejection_reason: null,
          approved_by: 1,
          approved_at: '2026-11-26T00:00:00Z',
        })
      ),
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

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should reject a pending document to REJECTED with rejection_reason', () => {
    const fixture = TestBed.createComponent(CaregiverAccounts);
    fixture.componentRef.setInput('caregiver', caregiver);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.rejectDoc(caregiver, docs[1]);

    expect(serviceMock.updateDocumentVerificationStatus).toHaveBeenCalledWith(
      202,
      4,
      'REJECTED',
      'Hồ sơ chưa đạt yêu cầu'
    );
    expect(comp.documents()[1].verification_status).toBe('REJECTED');
    expect(comp.documents()[1].rejection_reason).toBe('Hồ sơ chưa đạt yêu cầu');
  });

  it('should call updateUserProfile and updateCaregiverProfile when saving profile', () => {
    const fixture = TestBed.createComponent(CaregiverAccounts);
    fixture.componentRef.setInput('caregiver', caregiver);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const updatedSpy = vi.fn();
    comp.accountUpdated.subscribe(updatedSpy);

    comp.editFullName.set('Phạm Hoàng Nam Cập Nhật');
    comp.editExperienceYears.set(5);
    comp.editIntroduction.set('Giới thiệu mới');
    comp.saveProfile(caregiver);

    expect(serviceMock.updateUserProfile).toHaveBeenCalledWith(
      202,
      expect.objectContaining({ full_name: 'Phạm Hoàng Nam Cập Nhật' })
    );
    expect(serviceMock.updateCaregiverProfile).toHaveBeenCalledWith(
      202,
      expect.objectContaining({ experience_years: 5, introduction: 'Giới thiệu mới' })
    );
    expect(updatedSpy).toHaveBeenCalled();
  });
});