import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountOverviewItem,
  AccountStatus,
  VerificationStatus,
} from '../../../../core/models/account-management.model';
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

  readonly caregivers = signal<AccountOverviewItem[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<AccountStatus | 'ALL'>('ALL');

  readonly selectedCaregiver = signal<AccountOverviewItem | null>(null);
  readonly certificates = signal<CaregiverCertificate[]>([]);

  readonly filteredCaregivers = computed(() => {
    const keyword = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();

    return this.caregivers().filter((item) => {
      const matchStatus = status === 'ALL' || item.account_status === status;
      const matchKeyword =
        !keyword ||
        item.full_name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        (item.phone ?? '').toLowerCase().includes(keyword) ||
        (item.license_number ?? '').toLowerCase().includes(keyword);
      return matchStatus && matchKeyword;
    });
  });

  constructor() {
    this.loadCaregivers();
  }

  loadCaregivers(): void {
    this.accountsService
      .getAccounts({
        role: 'CAREGIVER',
        search: this.searchQuery(),
        status: this.statusFilter(),
      })
      .subscribe((list) => this.caregivers.set(list));
  }

  openCertificatesPopup(caregiver: AccountOverviewItem): void {
    this.selectedCaregiver.set(caregiver);
    this.certificates.set([]);

    this.accountsService
      .getCaregiverDocuments(caregiver.id)
      .subscribe((docs) => this.certificates.set(docs));
  }

  closeCertificatesPopup(): void {
    this.selectedCaregiver.set(null);
    this.certificates.set([]);
  }

  updateCertificateStatus(documentId: number, nextStatus: VerificationStatus): void {
    const caregiver = this.selectedCaregiver();
    if (!caregiver) return;

    const reason =
      nextStatus === 'REJECTED'
        ? 'Giấy tờ chưa rõ thông tin hoặc chưa khớp hồ sơ'
        : null;

    this.accountsService
      .updateDocumentVerificationStatus(caregiver.id, documentId, nextStatus, reason)
      .subscribe((res) => {
        this.certificates.update((list) =>
          list.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  verification_status: res.verification_status,
                  rejection_reason: nextStatus === 'REJECTED' ? reason : null,
                }
              : doc
          )
        );
      });
  }
}