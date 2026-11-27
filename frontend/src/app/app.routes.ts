import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AdminLayout } from './shared/components/admin-layout/admin-layout';
import { AdminDashboard } from './features/admin/dashboard/admin-dashboard';
import { AccountList } from './features/admin/accounts/account-list/account-list';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'accounts', component: AccountList },
    ],
  },
  { path: '**', redirectTo: 'login' },
];