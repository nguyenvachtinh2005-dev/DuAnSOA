import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRole } from '../../../../core/models/account-management.model';
import { AccountModeSelector } from '../account-mode-selector/account-mode-selector';
import { CustomerAccounts } from '../customer-accounts/customer-accounts';
import { CaregiverAccounts } from '../caregiver-accounts/caregiver-accounts';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, AccountModeSelector, CustomerAccounts, CaregiverAccounts],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
})
export class AccountList {
  readonly activeRole = signal<AccountRole | null>(null);

  onSelectRole(role: AccountRole): void {
    this.activeRole.set(role);
  }

  backToSelector(): void {
    this.activeRole.set(null);
  }
}