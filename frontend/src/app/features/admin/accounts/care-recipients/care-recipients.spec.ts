import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CareRecipients } from './care-recipients';
import { CareRecipientItem } from '../../../../core/models/account-management.model';

describe('CareRecipients', () => {
  const sampleRecipient: CareRecipientItem = {
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
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [CareRecipients],
    }).compileComponents();
  });

  it('should format gender in Vietnamese', () => {
    const fixture = TestBed.createComponent(CareRecipients);
    const comp = fixture.componentInstance;

    expect(comp.formatGender('MALE')).toBe('Nam');
    expect(comp.formatGender('FEMALE')).toBe('Nữ');
    expect(comp.formatGender('OTHER')).toBe('Khác');
    expect(comp.formatGender(null)).toBe('—');
  });

  it('should open edit popup, emit updated recipient, and close popup', () => {
    const fixture = TestBed.createComponent(CareRecipients);
    const comp = fixture.componentInstance;
    const updatedSpy = vi.fn();
    comp.recipientUpdated.subscribe(updatedSpy);

    comp.openEditPopup(sampleRecipient);
    expect(comp.editingRecipient()?.id).toBe(1);

    comp.editFullName.set('Trần Văn An Cập Nhật');
    comp.editGender.set('FEMALE');
    comp.saveRecipient();

    expect(updatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        full_name: 'Trần Văn An Cập Nhật',
        gender: 'FEMALE',
      })
    );
    expect(comp.editingRecipient()).toBeNull();
  });

  it('should emit recipientDeleted when deleteRecipient is confirmed', () => {
    const fixture = TestBed.createComponent(CareRecipients);
    const comp = fixture.componentInstance;
    const deletedSpy = vi.fn();
    comp.recipientDeleted.subscribe(deletedSpy);

    comp.deleteRecipient(sampleRecipient);
    expect(deletedSpy).toHaveBeenCalledWith(1);
  });
});