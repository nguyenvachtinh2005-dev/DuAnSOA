import { Routes } from '@angular/router';
import { AdminLayout } from './shared/components/admin-layout/admin-layout';
import { AdminDashboard } from './features/admin/dashboard/admin-dashboard';
import { AccountList } from './features/admin/accounts/account-list/account-list';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'accounts', component: AccountList },
    ],
  },
  { path: '**', redirectTo: 'admin/dashboard' },
];