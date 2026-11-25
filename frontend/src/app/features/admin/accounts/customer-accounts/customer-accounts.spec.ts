import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CustomerAccounts } from './customer-accounts';
import { AccountsService } from '../accounts.service';
import { AccountOverviewItem, CareRecipientItem } from '../../../../core/models/account-management.model';

describe('CustomerAccounts', () => {
  let serviceMock: {
    getCustomerRecipients: ReturnType<typeof vi.fn>;
    updateAccountStatus: ReturnType<typeof vi.fn>;
    deleteAccount: ReturnType<typeof vi.fn>;
  };

  const customer: AccountOverviewItem = {
    id: 101,
    role: 'CUSTOMER',
    email: 'minh@example.com',
    full_name: 'Trần Văn Minh',
    phone: '0905000101',
    account_status: 'ACTIVE',
    email_verified: true,
    last_login_at: null,
    created_at: '2026-01-01T00:00:00Z',
    recipients_count: 1,
  };

  const recipient: CareRecipientItem = {
    id: 1,
    customer_id: 101,
    full_name: 'Trần Văn An',
    relationship: 'Cha',
    date_of_birth: '1950-04-12',
    gender: 'MALE',
    medical_notes: 'Tăng huyết áp nhẹ',
    emergency_contact_name: 'Trần Văn Minh',
    emergency_contact_phone: '0905123456',
  };

  beforeEach(async () => {
    serviceMock = {
      getCustomerRecipients: vi.fn().mockReturnValue(of([recipient])),
      updateAccountStatus: vi.fn().mockReturnValue(of({ id: 101, account_status: 'LOCKED' })),
      deleteAccount: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerAccounts],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  it('should load recipients when customer input changes', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.componentRef.setInput('customer', customer);
    fixture.detectChanges();

    expect(serviceMock.getCustomerRecipients).toHaveBeenCalledWith(101);
    expect(fixture.componentInstance.recipients()).toEqual([recipient]);
  });

  it('should emit updated profile when saveProfile is called', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    const comp = fixture.componentInstance;
    const updatedSpy = vi.fn();
    comp.accountUpdated.subscribe(updatedSpy);

    comp.editFullName.set('Trần Văn Minh Mới');
    comp.editEmail.set('minh.new@example.com');
    comp.editPhone.set('0905999888');
    comp.saveProfile(customer);

    expect(updatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Trần Văn Minh Mới',
        email: 'minh.new@example.com',
        phone: '0905999888',
      })
    );
  });

  it('should update recipients list on recipientUpdated and recipientDeleted', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.componentRef.setInput('customer', customer);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.onRecipientUpdated({ ...recipient, full_name: 'Trần Văn An (Đã sửa)' });
    expect(comp.recipients()[0].full_name).toBe('Trần Văn An (Đã sửa)');

    comp.onRecipientDeleted(1);
    expect(comp.recipients()).toEqual([]);
  });
});