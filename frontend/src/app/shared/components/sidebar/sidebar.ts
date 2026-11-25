import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarNavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

const DEFAULT_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Trang chủ', route: '/admin/dashboard', icon: '⌂', exact: true },
  { label: 'Quản lý tài khoản', route: '/admin/accounts', icon: '👥' },
  { label: 'Quản lý đơn', route: '/admin/orders', icon: '📋' },
  { label: 'Thống kê & báo cáo', route: '/admin/reports', icon: '📊' },
  { label: 'Hồ sơ admin', route: '/admin/profile', icon: '⚙️' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  items = input<SidebarNavItem[]>(DEFAULT_ADMIN_NAV_ITEMS);
  collapsed = input<boolean>(false);
  logoutClick = output<void>();
}