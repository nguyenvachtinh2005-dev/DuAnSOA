import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AccountOverviewItem,
  AccountRole,
  AccountStatus,
} from '../../../../core/models/account-management.model';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';
import { AccountModeSelector } from '../account-mode-selector/account-mode-selector';
import { CustomerAccounts } from '../customer-accounts/customer-accounts';
import { CaregiverAccounts } from '../caregiver-accounts/caregiver-accounts';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AccountModeSelector, CustomerAccounts, CaregiverAccounts],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
})
export class AccountList implements OnInit, OnDestroy {
  private readonly accountsService = inject(AccountsService);
  private readonly searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  readonly activeRole = signal<AccountRole | null>(null);
  readonly searchQuery = signal('');
  readonly statusFilter = signal<AccountStatus | 'ALL'>('ALL');
  readonly accounts = signal<AccountOverviewItem[]>([]);
  readonly loading = signal(false);

  readonly selectedCustomer = signal<AccountOverviewItem | null>(null);
  readonly selectedCaregiver = signal<AccountOverviewItem | null>(null);
  readonly pendingDocCaregiverIds = signal<Set<number>>(new Set());
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchQuery.set(term);
        this.loadAccounts();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSelectRole(role: AccountRole): void {
    this.activeRole.set(role);
    this.selectedCustomer.set(null);
    this.selectedCaregiver.set(null);
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.loadAccounts();
  }

  backToSelector(): void {
    this.activeRole.set(null);
    this.accounts.set([]);
    this.selectedCustomer.set(null);
    this.selectedCaregiver.set(null);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onStatusFilterChange(value: AccountStatus | 'ALL'): void {
    this.statusFilter.set(value);
    this.loadAccounts();
  }

  loadAccounts(): void {
    const role = this.activeRole();
    if (!role) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.accountsService
      .getAccounts({
        role,
        search: this.searchQuery(),
        status: this.statusFilter(),
      })
      .subscribe({
        next: (list) => {
          this.accounts.set(list);
          this.loading.set(false);
          if (role === 'CAREGIVER') {
            this.refreshCaregiverPendingFlags(list);
          }
        },
        error: (err: unknown) => {
          this.accounts.set([]);
          this.loading.set(false);
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Không thể tải danh sách tài khoản.'
          );
        },
      });
  }

  hasPendingDocument(caregiverId: number): boolean {
    return this.activeRole() === 'CAREGIVER' && this.pendingDocCaregiverIds().has(caregiverId);
  }

  openProfile(item: AccountOverviewItem): void {
    if (this.activeRole() === 'CUSTOMER') {
      this.selectedCustomer.set(item);
      this.selectedCaregiver.set(null);
    } else if (this.activeRole() === 'CAREGIVER') {
      this.selectedCaregiver.set(item);
      this.selectedCustomer.set(null);
    }
  }

  onAccountUpdated(updated: AccountOverviewItem): void {
    this.accounts.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    if (this.selectedCustomer()?.id === updated.id) {
      this.selectedCustomer.set(updated);
    }
    if (this.selectedCaregiver()?.id === updated.id) {
      this.selectedCaregiver.set(updated);
    }
  }

  onAccountRemoved(accountId: number): void {
    this.accounts.update((rows) => rows.filter((r) => r.id !== accountId));
    this.pendingDocCaregiverIds.update((set) => {
      const next = new Set(set);
      next.delete(accountId);
      return next;
    });
    if (this.selectedCustomer()?.id === accountId) {
      this.selectedCustomer.set(null);
    }
    if (this.selectedCaregiver()?.id === accountId) {
      this.selectedCaregiver.set(null);
    }
  }

  onCaregiverPendingChanged(event: { caregiverId: number; hasPending: boolean }): void {
    this.pendingDocCaregiverIds.update((set) => {
      const next = new Set(set);
      if (event.hasPending) {
        next.add(event.caregiverId);
      } else {
        next.delete(event.caregiverId);
      }
      return next;
    });
  }

  private refreshCaregiverPendingFlags(list: AccountOverviewItem[]): void {
    const nextPending = new Set<number>();
    if (list.length === 0) {
      this.pendingDocCaregiverIds.set(nextPending);
      return;
    }

    let remaining = list.length;
    for (const item of list) {
      this.accountsService.getCaregiverDocuments(item.id).subscribe({
        next: (docs) => {
          if (docs.some((d) => d.verification_status !== 'APPROVED')) {
            nextPending.add(item.id);
          }
          remaining -= 1;
          if (remaining === 0) {
            this.pendingDocCaregiverIds.set(nextPending);
          }
        },
        error: () => {
          remaining -= 1;
          if (remaining === 0) {
            this.pendingDocCaregiverIds.set(nextPending);
          }
        },
      });
    }
  }
}