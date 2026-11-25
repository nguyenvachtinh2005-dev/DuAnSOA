import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccountModeSelector } from './account-mode-selector';

describe('AccountModeSelector', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountModeSelector],
    }).compileComponents();
  });

  it('phát sự kiện roleChange khi chọn vai trò khác vai trò đang chọn', () => {
    const fixture = TestBed.createComponent(AccountModeSelector);
    fixture.componentRef.setInput('selectedRole', 'CUSTOMER');
    const spy = vi.fn();
    fixture.componentInstance.roleChange.subscribe(spy);

    fixture.componentInstance.selectRole('CAREGIVER');
    expect(spy).toHaveBeenCalledWith('CAREGIVER');
  });

  it('không phát lặp lại roleChange khi bấm đúng vai trò đang được chọn', () => {
    const fixture = TestBed.createComponent(AccountModeSelector);
    fixture.componentRef.setInput('selectedRole', 'CUSTOMER');
    const spy = vi.fn();
    fixture.componentInstance.roleChange.subscribe(spy);

    fixture.componentInstance.selectRole('CUSTOMER');
    expect(spy).not.toHaveBeenCalled();
  });
});