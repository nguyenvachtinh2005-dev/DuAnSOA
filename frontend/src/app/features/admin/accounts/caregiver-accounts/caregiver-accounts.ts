import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountOverviewItem, AccountStatus } from '../../../../core/models/account-management.model';
import { CaregiverCertificate } from '../../../../core/models/caregiver-document.model';
import { AccountsService } from '../accounts.service';

@Component({
  selector: 'app-caregiver-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caregiver-accounts.html',
  styleUrl: './caregiver-accounts.scss',
})
export class CaregiverAccounts {
  private readonly accountsService = inject(AccountsService);

  readonly caregiver = input<AccountOverviewItem | null>(null);
  readonly closed = output<void>();
  readonly accountUpdated = output<AccountOverviewItem>();
  readonly accountRemoved = output<number>();
  readonly pendingChanged = output<{ caregiverId: number; hasPending: boolean }>();

  readonly documents = signal<CaregiverCertificate[]>([]);
  readonly editFullName = signal('');
  readonly editEmail = signal('');
  readonly editPhone = signal('');
  readonly editQualification = signal('');
  readonly editLicenseNumber = signal('');
  readonly editExperienceYears = signal(0);

  constructor() {
    effect(() => {
      const current = this.caregiver();
      if (!current) {
        this.documents.set([]);
        return;
      }

      this.editFullName.set(current.full_name ?? '');
      this.editEmail.set(current.email ?? '');
      this.editPhone.set(current.phone ?? '');
      this.editQualification.set(current.qualification ?? '');
      this.editLicenseNumber.set(current.license_number ?? '');
      this.editExperienceYears.set(current.experience_years ?? 0);

      this.accountsService.getCaregiverDocuments(current.id).subscribe((docs) => {
        this.documents.set(docs);
        this.pendingChanged.emit({
          caregiverId: current.id,
          hasPending: docs.some((d) => d.verification_status !== 'APPROVED'),
        });
      });
    });
  }

  close(): void {
    this.closed.emit();
  }

  saveProfile(item: AccountOverviewItem): void {
    const updated: AccountOverviewItem = {
      ...item,
      full_name: this.editFullName().trim(),
      email: this.editEmail().trim(),
      phone: this.editPhone().trim() || null,
      qualification: this.editQualification().trim() || null,
      license_number: this.editLicenseNumber().trim() || null,
      experience_years: Math.max(0, Number(this.editExperienceYears()) || 0),
    };
    this.accountUpdated.emit(updated);
  }

  changeStatus(item: AccountOverviewItem, nextStatus: AccountStatus): void {
    if (nextStatus === 'LOCKED' && !window.confirm(`Xác nhận khoá tài khoản "${item.full_name}"?`)) {
      return;
    }

    this.accountsService.updateAccountStatus(item.id, nextStatus).subscribe((res) => {
      this.accountUpdated.emit({ ...item, account_status: res.account_status });
    });
  }

  cancelAccount(item: AccountOverviewItem): void {
    if (!window.confirm(`Xác nhận huỷ tài khoản "${item.full_name}"?`)) {
      return;
    }

    this.accountsService.deleteAccount(item.id).subscribe(() => {
      this.accountRemoved.emit(item.id);
    });
  }

  approveDoc(item: AccountOverviewItem, doc: CaregiverCertificate): void {
    if (doc.verification_status !== 'PENDING') {
      return;
    }
    if (!window.confirm(`Xác nhận duyệt chứng chỉ "${doc.document_name}" của ${item.full_name}?`)) {
      return;
    }

    this.accountsService
      .updateDocumentVerificationStatus(item.id, doc.id, 'APPROVED')
      .subscribe((res) => {
        const nextDocs = this.documents().map((d) =>
          d.id === doc.id ? { ...d, verification_status: res.verification_status } : d
        );
        this.documents.set(nextDocs);
        this.pendingChanged.emit({
          caregiverId: item.id,
          hasPending: nextDocs.some((d) => d.verification_status === 'PENDING'),
        });
      });
  }

  rejectDoc(item: AccountOverviewItem, doc: CaregiverCertificate): void {
    if (doc.verification_status === 'APPROVED' || doc.verification_status === 'REJECTED') {
      return;
    }
    if (!window.confirm(`Xác nhận huỷ (từ chối) chứng chỉ "${doc.document_name}" của ${item.full_name}?`)) {
      return;
    }

    this.accountsService
      .updateDocumentVerificationStatus(item.id, doc.id, 'REJECTED')
      .subscribe((res) => {
        const nextDocs = this.documents().map((d) =>
          d.id === doc.id ? { ...d, verification_status: res.verification_status } : d
        );
        this.documents.set(nextDocs);
        this.pendingChanged.emit({
          caregiverId: item.id,
          hasPending: nextDocs.some((d) => d.verification_status === 'PENDING'),
        });
      });
  }
}