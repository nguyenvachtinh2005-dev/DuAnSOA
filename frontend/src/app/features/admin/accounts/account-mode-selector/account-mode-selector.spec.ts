import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AccountModeSelector } from './account-mode-selector';

describe('AccountModeSelector', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountModeSelector],
    }).compileComponents();
  });

  it('should create and expose CUSTOMER and CAREGIVER options', () => {
    const fixture = TestBed.createComponent(AccountModeSelector);
    const comp = fixture.componentInstance;
    expect(comp.options.map((o) => o.role)).toEqual(['CUSTOMER', 'CAREGIVER']);
  });

  it('should emit roleChange when selectRole is called', () => {
    const fixture = TestBed.createComponent(AccountModeSelector);
    const comp = fixture.componentInstance;
    const emitSpy = vi.fn();
    comp.roleChange.subscribe(emitSpy);

    comp.selectRole('CAREGIVER');
    expect(emitSpy).toHaveBeenCalledWith('CAREGIVER');
  });

  it('should return matching count for selected role', () => {
    const fixture = TestBed.createComponent(AccountModeSelector);
    fixture.componentRef.setInput('customerCount', 12);
    fixture.componentRef.setInput('caregiverCount', 5);
    expect(fixture.componentInstance.getCount('CUSTOMER')).toBe(12);
    expect(fixture.componentInstance.getCount('CAREGIVER')).toBe(5);
  });
});