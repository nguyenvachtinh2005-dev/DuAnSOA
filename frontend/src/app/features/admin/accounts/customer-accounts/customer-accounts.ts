import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountOverviewItem,
  AccountStatus,
  CareRecipientItem,
  Gender,
  UpdateAccountProfilePayload,
} from '../../../../core/models';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';
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
  readonly editPhone = signal('');
  readonly editDateOfBirth = signal('');
  readonly editGender = signal<Gender | ''>('');
  readonly editAvatarUrl = signal('');

  readonly recipients = signal<CareRecipientItem[]>([]);
  readonly loadingRecipients = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const current = this.customer();
      this.errorMessage.set(null);

      if (!current) {
        this.recipients.set([]);
        return;
      }

      this.editFullName.set(current.full_name ?? '');
      this.editPhone.set(current.phone ?? '');
      this.editDateOfBirth.set(current.date_of_birth ? current.date_of_birth.slice(0, 10) : '');
      this.editGender.set(current.gender ?? '');
      this.editAvatarUrl.set(current.avatar_url ?? '');

      this.loadingRecipients.set(true);
      this.accountsService.getCustomerRecipients(current.id).subscribe({
        next: (list) => {
          this.recipients.set(list);
          this.loadingRecipients.set(false);
        },
        error: (err: unknown) => {
          this.recipients.set([]);
          this.loadingRecipients.set(false);
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Không thể tải danh sách người được chăm sóc.'
          );
        },
      });
    });
  }

  close(): void {
    this.errorMessage.set(null);
    this.closed.emit();
  }

  saveProfile(item: AccountOverviewItem): void {
    this.errorMessage.set(null);

    const payload: UpdateAccountProfilePayload = {
      full_name: this.editFullName().trim(),
      phone: this.editPhone().trim() || null,
      date_of_birth: this.editDateOfBirth().trim() || null,
      gender: this.editGender() || null,
      avatar_url: this.editAvatarUrl().trim() || null,
    };

    this.accountsService.updateUserProfile(item.id, payload).subscribe({
      next: (saved) => {
        const merged: AccountOverviewItem = {
          ...item,
          ...payload,
          ...(saved ?? {}),
          id: saved?.id ?? item.id,
          email: saved?.email ?? item.email,
        };
        this.accountUpdated.emit(merged);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Cập nhật hồ sơ khách hàng thất bại.'
        );
      },
    });
  }

  toggleLock(item: AccountOverviewItem): void {
    this.errorMessage.set(null);

    const nextStatus: AccountStatus = item.account_status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    if (
      nextStatus === 'LOCKED' &&
      !window.confirm(`Xác nhận khoá tài khoản "${item.full_name}"?`)
    ) {
      return;
    }

    this.accountsService.updateAccountStatus(item.id, nextStatus).subscribe({
      next: (res) => {
        this.accountUpdated.emit({ ...item, account_status: res.account_status });
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Cập nhật trạng thái tài khoản thất bại.'
        );
      },
    });
  }

  onRecipientUpdated(updated: CareRecipientItem): void {
    this.errorMessage.set(null);

    const currentCustomer = this.customer();
    const targetCustomerId = updated.customer_id || currentCustomer?.id;
    if (!targetCustomerId) return;

    const { id: _ignoredId, customer_id: _ignoredCustomerId, ...payload } = updated;
    this.accountsService
      .updateCustomerRecipient(targetCustomerId, updated.id, payload)
      .subscribe({
        next: (saved) => {
          this.recipients.update((list) =>
            list.map((r) => (r.id === saved.id ? saved : r))
          );
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Cập nhật người được chăm sóc thất bại.'
          );
        },
      });
  }

  onRecipientDeleted(recipientId: number): void {
    this.errorMessage.set(null);

    const currentCustomer = this.customer();
    const targetCustomerId = currentCustomer?.id;

    const applyLocalRemoval = () => {
      this.recipients.update((list) => {
        const next = list.filter((r) => r.id !== recipientId);
        if (currentCustomer) {
          this.accountUpdated.emit({
            ...currentCustomer,
            recipients_count: next.length,
          });
        }
        return next;
      });
    };

    if (!targetCustomerId) {
      applyLocalRemoval();
      return;
    }

    this.accountsService
      .deleteCustomerRecipient(targetCustomerId, recipientId)
      .subscribe({
        next: () => applyLocalRemoval(),
        error: (err: unknown) => {
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Xoá người được chăm sóc thất bại.'
          );
        },
      });
  }

  onRecipientAdded(created: CareRecipientItem): void {
    this.errorMessage.set(null);

    const currentCustomer = this.customer();
    const targetCustomerId = created.customer_id || currentCustomer?.id;
    if (!targetCustomerId) return;

    const { id: _ignoredId, ...payload } = created;
    this.accountsService
      .addCustomerRecipient(targetCustomerId, payload)
      .subscribe({
        next: (saved) => {
          this.recipients.update((list) => {
            const next = [...list, saved];
            if (currentCustomer) {
              this.accountUpdated.emit({
                ...currentCustomer,
                recipients_count: next.length,
              });
            }
            return next;
          });
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Thêm người được chăm sóc thất bại.'
          );
        },
      });
  }

  deleteLocked(item: AccountOverviewItem): void {
    if (item.account_status !== 'LOCKED') return;
    this.errorMessage.set(null);

    if (!window.confirm(`Xác nhận xoá tài khoản đang bị khoá "${item.full_name}"?`)) {
      return;
    }

    this.accountsService.deleteAccount(item.id).subscribe({
      next: () => {
        this.accountRemoved.emit(item.id);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Xoá tài khoản thất bại.'
        );
      },
    });
  }
}