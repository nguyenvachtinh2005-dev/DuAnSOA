import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AccountOverviewItem, AccountStatus } from '../../../../core/models/account-management.model';
import { AccountsService } from '../accounts.service';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-accounts.html',
  styleUrl: './customer-accounts.scss',
})
export class CustomerAccounts implements OnInit, OnDestroy {
  private readonly accountsService = inject(AccountsService);
  private readonly searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  readonly searchQuery = signal('');
  readonly statusFilter = signal<AccountStatus | 'ALL'>('ALL');
  readonly customers = signal<AccountOverviewItem[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchQuery.set(term);
        this.loadCustomers();
      });

    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.accountsService
      .getAccounts({
        role: 'CUSTOMER',
        search: this.searchQuery(),
        status: this.statusFilter(),
      })
      .subscribe({
        next: (list) => {
          this.customers.set(list);
          this.loading.set(false);
        },
        error: () => {
          this.customers.set([]);
          this.loading.set(false);
        },
      });
  }

  toggleStatus(account: AccountOverviewItem): void {
    const nextStatus: AccountStatus = account.account_status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    this.accountsService.updateAccountStatus(account.id, nextStatus).subscribe((updated) => {
      this.customers.update((rows) =>
        rows.map((r) => (r.id === account.id ? { ...r, account_status: updated.account_status } : r))
      );
    });
  }
}