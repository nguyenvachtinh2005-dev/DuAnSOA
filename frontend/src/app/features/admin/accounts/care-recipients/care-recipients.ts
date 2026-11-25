import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareRecipientItem } from '../../../../core/models/account-management.model';

export type RecipientGender = 'MALE' | 'FEMALE' | 'OTHER';

@Component({
  selector: 'app-care-recipients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './care-recipients.html',
  styleUrl: './care-recipients.scss',
})
export class CareRecipients {
  readonly recipients = input<CareRecipientItem[]>([]);
  readonly loading = input(false);

  readonly recipientUpdated = output<CareRecipientItem>();
  readonly recipientDeleted = output<number>();

  readonly editingRecipient = signal<CareRecipientItem | null>(null);
  readonly editFullName = signal('');
  readonly editRelationship = signal('');
  readonly editDateOfBirth = signal('');
  readonly editGender = signal<RecipientGender | ''>('');
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

  openEditPopup(item: CareRecipientItem): void {
    this.editingRecipient.set(item);
    this.editFullName.set(item.full_name ?? '');
    this.editRelationship.set(item.relationship ?? '');
    this.editDateOfBirth.set(item.date_of_birth ?? '');
    this.editGender.set((item.gender as RecipientGender | null) ?? '');
    this.editMedicalNotes.set(item.medical_notes ?? '');
    this.editEmergencyName.set(item.emergency_contact_name ?? '');
    this.editEmergencyPhone.set(item.emergency_contact_phone ?? '');
  }

  closeEditPopup(): void {
    this.editingRecipient.set(null);
  }

  saveRecipient(): void {
    const current = this.editingRecipient();
    if (!current) return;

    const updated: CareRecipientItem = {
      ...current,
      full_name: this.editFullName().trim(),
      relationship: this.editRelationship().trim(),
      date_of_birth: this.editDateOfBirth().trim() || null,
      gender: this.editGender() || null,
      medical_notes: this.editMedicalNotes().trim() || null,
      emergency_contact_name: this.editEmergencyName().trim() || null,
      emergency_contact_phone: this.editEmergencyPhone().trim() || null,
    };

    this.recipientUpdated.emit(updated);
    this.editingRecipient.set(null);
  }

  deleteRecipient(item: CareRecipientItem): void {
    if (!window.confirm(`Xác nhận xoá người được chăm sóc "${item.full_name}"?`)) {
      return;
    }

    if (this.editingRecipient()?.id === item.id) {
      this.editingRecipient.set(null);
    }

    this.recipientDeleted.emit(item.id);
  }
}