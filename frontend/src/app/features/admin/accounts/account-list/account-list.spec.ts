import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { AccountList } from './account-list';
import { AccountsService } from '../accounts.service';

describe('AccountList', () => {
  const serviceMock = {
    getAccounts: vi.fn().mockReturnValue(of([])),
    updateAccountStatus: vi.fn(),
    getCaregiverDocuments: vi.fn().mockReturnValue(of([])),
    updateDocumentVerificationStatus: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AccountList],
      providers: [{ provide: AccountsService, useValue: serviceMock }],
    }).compileComponents();
  });

  it('mặc định chưa chọn loại tài khoản và quay lại màn chọn khi bấm comeback', () => {
    const fixture = TestBed.createComponent(AccountList);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    expect(comp.activeRole()).toBeNull();

    comp.onSelectRole('CAREGIVER');
    expect(comp.activeRole()).toBe('CAREGIVER');

    comp.backToSelector();
    expect(comp.activeRole()).toBeNull();
  });
});