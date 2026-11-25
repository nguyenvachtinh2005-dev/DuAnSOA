import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountOverviewItem,
  AccountStatus,
  CareRecipientItem,
} from '../../../../core/models/account-management.model';
import { AccountsService } from '../accounts.service';
import { CareRecipients } from '../care-recipients/care-recipients';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, CareRecipients],
  templateUrl: './customer-accounts.html',
  styleUrl: './customer-accounts.scss',
})
export class CustomerAccounts {
  private readonly accountsService = inject(AccountsService);

  readonly customer = input<AccountOverviewItem | null>(null);
  readonly closed = output<void>();
  readonly accountUpdated = output<AccountOverviewItem>();
  readonly accountRemoved = output<number>();

  readonly editFullName = signal('');
  readonly editEmail = signal('');
  readonly editPhone = signal('');

  readonly recipients = signal<CareRecipientItem[]>([]);
  readonly loadingRecipients = signal(false);

  constructor() {
    effect(() => {
      const current = this.customer();
      if (!current) {
        this.recipients.set([]);
        return;
      }

      this.editFullName.set(current.full_name ?? '');
      this.editEmail.set(current.email ?? '');
      this.editPhone.set(current.phone ?? '');

      this.loadingRecipients.set(true);
      this.accountsService.getCustomerRecipients(current.id).subscribe({
        next: (list) => {
          this.recipients.set(list);
          this.loadingRecipients.set(false);
        },
        error: () => {
          this.recipients.set([]);
          this.loadingRecipients.set(false);
        },
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
    };
    this.accountUpdated.emit(updated);
  }

  toggleLock(item: AccountOverviewItem): void {
    const nextStatus: AccountStatus = item.account_status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    if (
      nextStatus === 'LOCKED' &&
      !window.confirm(`Xác nhận khoá tài khoản "${item.full_name}"?`)
    ) {
      return;
    }

    this.accountsService.updateAccountStatus(item.id, nextStatus).subscribe((res) => {
      this.accountUpdated.emit({ ...item, account_status: res.account_status });
    });
  }

  onRecipientUpdated(updated: CareRecipientItem): void {
    this.recipients.update((list) =>
      list.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  onRecipientDeleted(recipientId: number): void {
    this.recipients.update((list) => {
      const next = list.filter((r) => r.id !== recipientId);
      const currentCustomer = this.customer();
      if (currentCustomer) {
        this.accountUpdated.emit({
          ...currentCustomer,
          recipients_count: next.length,
        });
      }
      return next;
    });
  }

  deleteLocked(item: AccountOverviewItem): void {
    if (item.account_status !== 'LOCKED') return;
    if (!window.confirm(`Xác nhận xoá tài khoản đang bị khoá "${item.full_name}"?`)) {
      return;
    }

    this.accountsService.deleteAccount(item.id).subscribe(() => {
      this.accountRemoved.emit(item.id);
    });
  }
}