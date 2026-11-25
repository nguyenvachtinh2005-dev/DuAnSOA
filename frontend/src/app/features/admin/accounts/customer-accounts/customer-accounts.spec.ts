import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CustomerAccounts } from './customer-accounts';
import { AccountsService } from '../accounts.service';
import { AccountOverviewItem } from '../../../../core/models/account-management.model';

describe('CustomerAccounts', () => {
  const sampleCustomers: AccountOverviewItem[] = [
    {
      id: 101,
      full_name: 'Trần Văn Minh',
      email: 'minh@homecare.vn',
      phone: '0901234567',
      role: 'CUSTOMER',
      account_status: 'ACTIVE',
    } as AccountOverviewItem,
    {
      id: 102,
      full_name: 'Nguyễn Thị Lan',
      email: 'lan@homecare.vn',
      phone: '0907654321',
      role: 'CUSTOMER',
      account_status: 'LOCKED',
    } as AccountOverviewItem,
  ];

  const serviceMock = {
    getAccounts: vi.fn(),
    updateAccountStatus: vi.fn(),
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    serviceMock.getAccounts.mockReturnValue(of(sampleCustomers));
    serviceMock.updateAccountStatus.mockImplementation((id, nextStatus) =>
      of({ id, account_status: nextStatus })
    );

    await TestBed.configureTestingModule({
      imports: [CustomerAccounts],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tải danh sách khách hàng khi khởi tạo', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.detectChanges();

    expect(serviceMock.getAccounts).toHaveBeenCalledWith({
      role: 'CUSTOMER',
      search: '',
      status: 'ALL',
    });
    expect(fixture.componentInstance.customers()).toEqual(sampleCustomers);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('debounce 300ms khi nhập ô tìm kiếm và gọi lại loadCustomers', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.detectChanges();
    serviceMock.getAccounts.mockClear();

    fixture.componentInstance.onSearchInput('Minh');
    vi.advanceTimersByTime(150);
    expect(serviceMock.getAccounts).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(fixture.componentInstance.searchQuery()).toBe('Minh');
    expect(serviceMock.getAccounts).toHaveBeenCalledTimes(1);
    expect(serviceMock.getAccounts).toHaveBeenCalledWith({
      role: 'CUSTOMER',
      search: 'Minh',
      status: 'ALL',
    });
  });

  it('toggleStatus chuyển ACTIVE -> LOCKED và cập nhật danh sách', () => {
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.detectChanges();

    fixture.componentInstance.toggleStatus(sampleCustomers[0]);

    expect(serviceMock.updateAccountStatus).toHaveBeenCalledWith(101, 'LOCKED');
    const updated = fixture.componentInstance.customers().find((c) => c.id === 101);
    expect(updated?.account_status).toBe('LOCKED');
  });

  it('đưa danh sách về rỗng khi loadCustomers gặp lỗi', () => {
    serviceMock.getAccounts.mockReturnValueOnce(throwError(() => new Error('Network error')));
    const fixture = TestBed.createComponent(CustomerAccounts);
    fixture.detectChanges();

    expect(fixture.componentInstance.customers()).toEqual([]);
    expect(fixture.componentInstance.loading()).toBe(false);
  });
});