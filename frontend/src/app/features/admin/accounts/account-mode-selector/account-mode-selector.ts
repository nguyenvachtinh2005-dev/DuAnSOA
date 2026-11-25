import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountModeOption, AccountRole } from '../../../../core/models/account-management.model';

@Component({
  selector: 'app-account-mode-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-mode-selector.html',
  styleUrl: './account-mode-selector.scss',
})
export class AccountModeSelector {
  readonly selectedRole = input<AccountRole>('CUSTOMER');
  readonly customerCount = input<number | null>(null);
  readonly caregiverCount = input<number | null>(null);

  readonly roleChange = output<AccountRole>();

  readonly options: AccountModeOption[] = [
    {
      role: 'CUSTOMER',
      label: 'Tài khoản khách hàng',
      shortLabel: 'Khách hàng',
      description: 'Xem hồ sơ khách hàng, người được chăm sóc và trạng thái tài khoản.',
      badgeText: 'CUSTOMER',
    },
    {
      role: 'CAREGIVER',
      label: 'Tài khoản nhân viên chăm sóc y tế',
      shortLabel: 'Nhân viên chăm sóc',
      description: 'Xem hồ sơ chuyên môn, chứng chỉ/giấy tờ và trạng thái xác minh.',
      badgeText: 'CAREGIVER',
    },
  ];

  selectRole(role: AccountRole): void {
    if (role !== this.selectedRole()) {
      this.roleChange.emit(role);
    }
  }

  getCount(role: AccountRole): number | null {
    return role === 'CUSTOMER' ? this.customerCount() : this.caregiverCount();
  }
}