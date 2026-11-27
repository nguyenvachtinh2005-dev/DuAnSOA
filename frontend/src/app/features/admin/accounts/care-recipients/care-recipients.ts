import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareRecipientItem, Gender } from '../../../../core/models';

@Component({
  selector: 'app-care-recipients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './care-recipients.html',
  styleUrl: './care-recipients.scss',
})
export class CareRecipients {
  readonly recipients = input<CareRecipientItem[]>([]);
  readonly customerId = input<number>(0);
  readonly loading = input(false);

  readonly recipientAdded = output<CareRecipientItem>();
  readonly recipientUpdated = output<CareRecipientItem>();
  readonly recipientDeleted = output<number>();

  readonly popupOpen = signal(false);
  readonly editingRecipient = signal<CareRecipientItem | null>(null);
  readonly formError = signal<string | null>(null);

  readonly editFullName = signal('');
  readonly editRelationship = signal('');
  readonly editDateOfBirth = signal('');
  readonly editGender = signal<Gender | ''>('');
  readonly editMedicalNotes = signal('');
  readonly editEmergencyName = signal('');
  readonly editEmergencyPhone = signal('');

  formatGender(gender?: string | null): string {
    switch (gender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return '—';
    }
  }

  openAddPopup(): void {
    this.formError.set(null);
    this.editingRecipient.set(null);
    this.editFullName.set('');
    this.editRelationship.set('');
    this.editDateOfBirth.set('');
    this.editGender.set('');
    this.editMedicalNotes.set('');
    this.editEmergencyName.set('');
    this.editEmergencyPhone.set('');
    this.popupOpen.set(true);
  }

  openEditPopup(item: CareRecipientItem): void {
    this.formError.set(null);
    this.editingRecipient.set(item);
    this.editFullName.set(item.full_name ?? '');
    this.editRelationship.set(item.relationship ?? '');
    this.editDateOfBirth.set(item.date_of_birth ? item.date_of_birth.slice(0, 10) : '');
    this.editGender.set(item.gender ?? '');
    this.editMedicalNotes.set(item.medical_notes ?? '');
    this.editEmergencyName.set(item.emergency_contact_name ?? '');
    this.editEmergencyPhone.set(item.emergency_contact_phone ?? '');
    this.popupOpen.set(true);
  }

  closePopup(): void {
    this.formError.set(null);
    this.popupOpen.set(false);
    this.editingRecipient.set(null);
  }

  saveRecipient(): void {
    const fullName = this.editFullName().trim();
    const relationship = this.editRelationship().trim();
    if (!fullName || !relationship) {
      this.formError.set('Vui lòng nhập đầy đủ Họ và tên và Mối quan hệ.');
      return;
    }

    this.formError.set(null);

    const current = this.editingRecipient();
    const payloadFields = {
      full_name: fullName,
      relationship,
      date_of_birth: this.editDateOfBirth().trim() || null,
      gender: (this.editGender() || null) as Gender | null,
      medical_notes: this.editMedicalNotes().trim() || null,
      emergency_contact_name: this.editEmergencyName().trim() || null,
      emergency_contact_phone: this.editEmergencyPhone().trim() || null,
    };

    if (current) {
      this.recipientUpdated.emit({
        ...current,
        ...payloadFields,
      });
    } else {
      const nextId =
        this.recipients().reduce((max, r) => Math.max(max, r.id), 0) + 1;
      this.recipientAdded.emit({
        id: nextId,
        customer_id: this.customerId(),
        ...payloadFields,
      });
    }

    this.closePopup();
  }

  deleteRecipient(item: CareRecipientItem): void {
    if (!window.confirm(`Xác nhận xoá người được chăm sóc "${item.full_name}"?`)) {
      return;
    }

    if (this.editingRecipient()?.id === item.id) {
      this.closePopup();
    }

    this.recipientDeleted.emit(item.id);
  }
}