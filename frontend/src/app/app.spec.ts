import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { Auth } from './core/services/auth';
import { authGuard } from './core/guards/auth-guard';

@Component({ standalone: true, template: '<p>Login View</p>' })
class DummyLogin {}

@Component({ standalone: true, template: '<p>Admin Dashboard View</p>' })
class DummyAdminDashboard {}

describe('App', () => {
  const authMock = {
    getToken: vi.fn().mockReturnValue(null),
    getRole: vi.fn().mockReturnValue(null),
    isAdminAuthenticated: vi.fn().mockReturnValue(false),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    authMock.getToken.mockReturnValue(null);
    authMock.getRole.mockReturnValue(null);
    authMock.isAdminAuthenticated.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', redirectTo: 'login', pathMatch: 'full' },
          { path: 'login', component: DummyLogin },
          {
            path: 'admin/dashboard',
            component: DummyAdminDashboard,
            canActivate: [authGuard],
          },
        ]),
        { provide: Auth, useValue: authMock },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should redirect unauthenticated user away from admin dashboard to login', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();

    await router.navigateByUrl('/admin/dashboard');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toContain('/login');
  });

  it('should allow authenticated ADMIN user to access admin dashboard', async () => {
    authMock.isAdminAuthenticated.mockReturnValue(true);

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();

    await router.navigateByUrl('/admin/dashboard');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/admin/dashboard');
  });
});