import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { AccountList } from './account-list';
import { AccountsService } from '../accounts.service';
import { AccountOverviewItem } from '../../../../core/models/account-management.model';

describe('AccountList', () => {
  let serviceMock: {
    getAccounts: ReturnType<typeof vi.fn>;
    getCaregiverDocuments: ReturnType<typeof vi.fn>;
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
        .mockReturnValue(of([{ id: 3, caregiver_id: 202, verification_status: 'PENDING' }])),
    };

    await TestBed.configureTestingModule({
      imports: [AccountList],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should load accounts when selecting a role and reset on backToSelector', () => {
    const fixture = TestBed.createComponent(AccountList);
    const comp = fixture.componentInstance;

    comp.onSelectRole('CUSTOMER');
    expect(comp.activeRole()).toBe('CUSTOMER');
    expect(comp.accounts()).toEqual([sampleCustomer]);

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
});