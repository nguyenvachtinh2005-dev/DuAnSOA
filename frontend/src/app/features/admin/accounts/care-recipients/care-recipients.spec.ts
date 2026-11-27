import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CareRecipients } from './care-recipients';
import { CareRecipientItem } from '../../../../core/models';

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

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should open add popup, emit recipientAdded with customerId, and close popup', () => {
    const fixture = TestBed.createComponent(CareRecipients);
    fixture.componentRef.setInput('recipients', [sampleRecipient]);
    fixture.componentRef.setInput('customerId', 101);
    const comp = fixture.componentInstance;
    const addedSpy = vi.fn();
    comp.recipientAdded.subscribe(addedSpy);

    comp.openAddPopup();
    expect(comp.popupOpen()).toBe(true);
    expect(comp.editingRecipient()).toBeNull();

    comp.editFullName.set('Nguyễn Thị Hoa');
    comp.editRelationship.set('Mẹ');
    comp.editDateOfBirth.set('1954-09-21');
    comp.editGender.set('FEMALE');
    comp.editMedicalNotes.set('Đau khớp gối');
    comp.editEmergencyName.set('Trần Văn Minh');
    comp.editEmergencyPhone.set('0905123456');
    comp.saveRecipient();

    expect(addedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        customer_id: 101,
        full_name: 'Nguyễn Thị Hoa',
        relationship: 'Mẹ',
        date_of_birth: '1954-09-21',
        gender: 'FEMALE',
        medical_notes: 'Đau khớp gối',
        emergency_contact_name: 'Trần Văn Minh',
        emergency_contact_phone: '0905123456',
      })
    );
    expect(comp.popupOpen()).toBe(false);
  });

  it('should set formError and not emit recipientAdded when required full_name or relationship is empty', () => {
    const fixture = TestBed.createComponent(CareRecipients);
    const comp = fixture.componentInstance;
    const addedSpy = vi.fn();
    comp.recipientAdded.subscribe(addedSpy);

    comp.openAddPopup();
    comp.editFullName.set('   ');
    comp.editRelationship.set('Mẹ');
    comp.saveRecipient();

    expect(addedSpy).not.toHaveBeenCalled();
    expect(comp.popupOpen()).toBe(true);
    expect(comp.formError()).toBe('Vui lòng nhập đầy đủ Họ và tên và Mối quan hệ.');
  });
});