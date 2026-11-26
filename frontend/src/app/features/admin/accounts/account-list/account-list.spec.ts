import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { AccountList } from './account-list';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';
import { AccountOverviewItem } from '../../../../core/models';

describe('AccountList', () => {
  let serviceMock: {
    getAccounts: ReturnType<typeof vi.fn>;
    getCaregiverDocuments: ReturnType<typeof vi.fn>;
    getCaregiverProfile: ReturnType<typeof vi.fn>;
    getCustomerRecipients: ReturnType<typeof vi.fn>;
    updateUserProfile: ReturnType<typeof vi.fn>;
    updateCaregiverProfile: ReturnType<typeof vi.fn>;
    updateAccountStatus: ReturnType<typeof vi.fn>;
    deleteAccount: ReturnType<typeof vi.fn>;
    addCustomerRecipient: ReturnType<typeof vi.fn>;
    updateCustomerRecipient: ReturnType<typeof vi.fn>;
    deleteCustomerRecipient: ReturnType<typeof vi.fn>;
    updateDocumentVerificationStatus: ReturnType<typeof vi.fn>;
  };

  const sampleCustomer: AccountOverviewItem = {
    id: 101,
    role: 'CUSTOMER',
    email: 'minh@example.com',
    full_name: 'Trần Văn Minh',
    phone: '0905000101',
    account_status: 'ACTIVE',
    email_verified: true,
    last_login_at: null,
    created_at: '2026-01-01T00:00:00Z',
    recipients_count: 2,
  };

  const sampleCaregiver: AccountOverviewItem = {
    id: 202,
    role: 'CAREGIVER',
    email: 'nam@example.com',
    full_name: 'Phạm Hoàng Nam',
    phone: '0905000202',
    account_status: 'ACTIVE',
    email_verified: true,
    last_login_at: null,
    created_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    serviceMock = {
      getAccounts: vi.fn().mockReturnValue(of([sampleCustomer])),
      getCaregiverDocuments: vi
        .fn()
        .mockReturnValue(
          of([
            {
              id: 3,
              caregiver_id: 202,
              document_type: 'DEGREE',
              document_name: 'Chứng chỉ',
              document_url: 'https://example.com/doc.pdf',
              verification_status: 'PENDING',
            },
          ])
        ),
      getCaregiverProfile: vi.fn().mockReturnValue(of(null)),
      getCustomerRecipients: vi.fn().mockReturnValue(of([])),
      updateUserProfile: vi.fn().mockReturnValue(of(sampleCustomer)),
      updateCaregiverProfile: vi.fn().mockReturnValue(of(null)),
      updateAccountStatus: vi.fn().mockReturnValue(of({ id: 202, account_status: 'LOCKED' })),
      deleteAccount: vi.fn().mockReturnValue(of(void 0)),
      addCustomerRecipient: vi.fn(),
      updateCustomerRecipient: vi.fn(),
      deleteCustomerRecipient: vi.fn().mockReturnValue(of(void 0)),
      updateDocumentVerificationStatus: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AccountList],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('should load accounts when selecting a role and reset on backToSelector', () => {
    const fixture = TestBed.createComponent(AccountList);
    const comp = fixture.componentInstance;

    comp.onSelectRole('CUSTOMER');
    expect(comp.activeRole()).toBe('CUSTOMER');
    expect(comp.accounts()).toEqual([sampleCustomer]);
    expect(comp.errorMessage()).toBeNull();

    comp.backToSelector();
    expect(comp.activeRole()).toBeNull();
    expect(comp.accounts()).toEqual([]);
  });

  it('should debounce search input before querying accounts', () => {
    const fixture = TestBed.createComponent(AccountList);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.onSelectRole('CUSTOMER');
    serviceMock.getAccounts.mockClear();

    comp.onSearchInput('Trần');
    vi.advanceTimersByTime(150);
    expect(serviceMock.getAccounts).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(serviceMock.getAccounts).toHaveBeenCalledTimes(1);
    expect(comp.searchQuery()).toBe('Trần');
  });

  it('should flag pending caregiver documents and update/remove accounts', () => {
    const fixture = TestBed.createComponent(AccountList);
    const comp = fixture.componentInstance;
    serviceMock.getAccounts.mockReturnValue(of([sampleCaregiver]));

    comp.onSelectRole('CAREGIVER');
    expect(comp.hasPendingDocument(202)).toBe(true);

    comp.openProfile(sampleCaregiver);
    expect(comp.selectedCaregiver()?.id).toBe(202);

    const updatedCaregiver: AccountOverviewItem = { ...sampleCaregiver, account_status: 'LOCKED' };
    comp.onAccountUpdated(updatedCaregiver);
    expect(comp.accounts()[0].account_status).toBe('LOCKED');

    comp.onAccountRemoved(202);
    expect(comp.accounts()).toEqual([]);
    expect(comp.selectedCaregiver()).toBeNull();
  });

  it('should display errorMessage when getAccounts fails due to missing token or non-ADMIN role', () => {
    const fixture = TestBed.createComponent(AccountList);
    const comp = fixture.componentInstance;
    serviceMock.getAccounts.mockReturnValue(
      throwError(() => new Error('Chỉ tài khoản có quyền ADMIN mới được thực hiện thao tác này.'))
    );

    comp.onSelectRole('CUSTOMER');
    fixture.detectChanges();

    expect(comp.accounts()).toEqual([]);
    expect(comp.errorMessage()).toBe(
      'Chỉ tài khoản có quyền ADMIN mới được thực hiện thao tác này.'
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Chỉ tài khoản có quyền ADMIN mới được thực hiện thao tác này.'
    );
  });
});