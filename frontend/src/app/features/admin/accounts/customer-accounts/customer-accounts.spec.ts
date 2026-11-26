import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CustomerAccounts } from './customer-accounts';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';
import { AccountOverviewItem, CareRecipientItem } from '../../../../core/models';

describe('CustomerAccounts', () => {
  let serviceMock: {
    getCustomerRecipients: ReturnType<typeof vi.fn>;
    addCustomerRecipient: ReturnType<typeof vi.fn>;
    updateCustomerRecipient: ReturnType<typeof vi.fn>;
    deleteCustomerRecipient: ReturnType<typeof vi.fn>;
    updateUserProfile: ReturnType<typeof vi.fn>;
    updateAccountStatus: ReturnType<typeof vi.fn>;
    deleteAccount: ReturnType<typeof vi.fn>;
  };

  const customer: AccountOverviewItem = {
    id: 101,
    role: 'CUSTOMER',
    email: 'minh@example.com',
    full_name: 'Trần Văn Minh',
    phone: '0905000101',
    date_of_birth: '1988-02-15',
    gender: 'MALE',
    avatar_url: 'https://example.com/avatar.png',
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
      addCustomerRecipient: vi
        .fn()
        .mockImplementation((customerId, payload) =>
          of({ id: 2, customer_id: customerId, ...payload })
        ),
      updateCustomerRecipient: vi
        .fn()
        .mockImplementation((customerId, recipientId, payload) =>
          of({ ...recipient, ...payload, id: recipientId, customer_id: customerId })
        ),
      deleteCustomerRecipient: vi.fn().mockReturnValue(of(void 0)),
      updateUserProfile: vi
        .fn()
        .mockImplementation((userId, payload) => of({ ...customer, ...payload, id: userId })),
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

  it('should call updateUserProfile and emit updated profile when saveProfile is called', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    const comp = fixture.componentInstance;
    const updatedSpy = vi.fn();
    comp.accountUpdated.subscribe(updatedSpy);

    comp.editFullName.set('Trần Văn Minh Mới');
    comp.editPhone.set('0905999888');
    comp.editDateOfBirth.set('1989-03-20');
    comp.editGender.set('OTHER');
    comp.editAvatarUrl.set('https://example.com/new-avatar.png');
    comp.saveProfile(customer);

    expect(serviceMock.updateUserProfile).toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        full_name: 'Trần Văn Minh Mới',
        phone: '0905999888',
        date_of_birth: '1989-03-20',
        gender: 'OTHER',
        avatar_url: 'https://example.com/new-avatar.png',
      })
    );
    expect(updatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Trần Văn Minh Mới',
        phone: '0905999888',
        gender: 'OTHER',
      })
    );
  });

  it('should call addCustomerRecipient, append recipient, and emit updated count', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.componentRef.setInput('customer', customer);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const updatedSpy = vi.fn();
    comp.accountUpdated.subscribe(updatedSpy);

    const added: CareRecipientItem = {
      id: 2,
      customer_id: 101,
      full_name: 'Nguyễn Thị Hoa',
      relationship: 'Mẹ',
      date_of_birth: '1954-09-21',
      gender: 'FEMALE',
      medical_notes: 'Đau khớp gối',
      emergency_contact_name: 'Trần Văn Minh',
      emergency_contact_phone: '0905123456',
    };

    comp.onRecipientAdded(added);

    expect(serviceMock.addCustomerRecipient).toHaveBeenCalledWith(
      101,
      expect.objectContaining({ full_name: 'Nguyễn Thị Hoa', relationship: 'Mẹ' })
    );
    expect(comp.recipients().length).toBe(2);
    expect(updatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 101, recipients_count: 2 })
    );
  });

  it('should call updateCustomerRecipient and deleteCustomerRecipient', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.componentRef.setInput('customer', customer);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.onRecipientUpdated({ ...recipient, full_name: 'Trần Văn An (Đã sửa)' });
    expect(serviceMock.updateCustomerRecipient).toHaveBeenCalledWith(
      101,
      1,
      expect.objectContaining({ full_name: 'Trần Văn An (Đã sửa)' })
    );
    expect(comp.recipients()[0].full_name).toBe('Trần Văn An (Đã sửa)');

    comp.onRecipientDeleted(1);
    expect(serviceMock.deleteCustomerRecipient).toHaveBeenCalledWith(101, 1);
    expect(comp.recipients()).toEqual([]);
  });
});