// @vitest-environment jsdom
import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountModeSelector } from './account-mode-selector';
import { AccountRole } from '../../../../core/models';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';
import { assertAdminToken, getAccessToken } from '../../../../core/services';
import {
  MOCK_ADMIN_TOKEN,
  MOCK_CAREGIVER_ACCOUNTS,
  MOCK_CUSTOMER_ACCOUNTS,
  wrapApiResponse,
} from '../../../../core/mocks';

vi.mock('../../../../core/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../core/services')>();
  return {
    ...actual,
    assertAdminToken: vi.fn(() => ({ sub: 1, role: 'ADMIN' })),
    getAccessToken: vi.fn(() => 'mock-admin-token'),
  };
});

@Component({
  selector: 'app-selector-flow-host',
  standalone: true,
  imports: [AccountModeSelector],
  template: `
    <app-account-mode-selector
      [selectedRole]="activeRole()"
      [customerCount]="customerCount()"
      [caregiverCount]="caregiverCount()"
      [disabled]="isDisabled()"
      (roleChange)="handleRoleChange($event)"
    />
    <div data-testid="current-role-view">Đang chọn: {{ activeRole() }}</div>
  `,
})
class SelectorFlowHostComponent {
  private readonly router = inject(Router);
  readonly activeRole = signal<AccountRole>('CUSTOMER');
  readonly customerCount = signal<number | null>(null);
  readonly caregiverCount = signal<number | null>(null);
  readonly isDisabled = signal<boolean>(false);
  readonly navigatedRoles: AccountRole[] = [];

  handleRoleChange(role: AccountRole): void {
    this.activeRole.set(role);
    this.navigatedRoles.push(role);
    void this.router.navigate(['/admin/accounts'], { queryParams: { role } });
  }
}

@Component({
  selector: 'app-next-accounts-page',
  standalone: true,
  template: `<section data-testid="next-page">Trang danh sách tài khoản</section>`,
})
class NextAccountsPageComponent {}

describe('AccountModeSelector standalone & integration flow', () => {
  let httpMock: HttpTestingController | undefined;
  const expectedToken = MOCK_ADMIN_TOKEN || 'mock-admin-token';

  beforeEach(async () => {
    vi.mocked(assertAdminToken).mockReturnValue({ sub: 1, role: 'ADMIN' });
    vi.mocked(getAccessToken).mockReturnValue(expectedToken);

    await TestBed.configureTestingModule({
      imports: [AccountModeSelector, SelectorFlowHostComponent, NextAccountsPageComponent],
      providers: [
        AccountsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: SelectorFlowHostComponent },
          { path: 'admin/accounts', component: NextAccountsPageComponent },
        ]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
    httpMock = undefined;
    TestBed.resetTestingModule();
  });

  it('should match design options, active state, counts, and respect disabled input', () => {
    const fixture = TestBed.createComponent(AccountModeSelector);
    fixture.componentRef.setInput('selectedRole', 'CUSTOMER');
    fixture.componentRef.setInput('customerCount', MOCK_CUSTOMER_ACCOUNTS.length);
    fixture.componentRef.setInput('caregiverCount', MOCK_CAREGIVER_ACCOUNTS.length);
    fixture.detectChanges();

    expect(fixture.componentInstance.options.map((o) => o.role)).toEqual([
      'CUSTOMER',
      'CAREGIVER',
    ]);

    const tabs = fixture.nativeElement.querySelectorAll(
      'button[role="tab"]'
    ) as NodeListOf<HTMLButtonElement>;
    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(fixture.nativeElement.textContent).toContain('Tài khoản khách hàng');
    expect(fixture.nativeElement.textContent).toContain('Tài khoản nhân viên chăm sóc y tế');
    expect(fixture.nativeElement.textContent).toContain(String(MOCK_CUSTOMER_ACCOUNTS.length));
    expect(fixture.nativeElement.textContent).toContain(String(MOCK_CAREGIVER_ACCOUNTS.length));

    const emitSpy = vi.fn();
    fixture.componentInstance.roleChange.subscribe(emitSpy);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    tabs[1].click();
    expect(emitSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    tabs[1].click();
    expect(emitSpy).toHaveBeenCalledWith('CAREGIVER');
  });

  it('should verify outgoing HTTP request, mock API response, and update counts', () => {
    const accountsService = TestBed.inject(AccountsService);
    const fixture = TestBed.createComponent(SelectorFlowHostComponent);
    fixture.detectChanges();

    accountsService.getAccounts({ role: 'CUSTOMER', status: 'ALL' }).subscribe((items) => {
      fixture.componentInstance.customerCount.set(items.length);
      fixture.detectChanges();
      expect(items.map((x) => x.full_name)).toEqual(['Trần Văn Minh', 'Nguyễn Thị Lan']);
    });

    accountsService.getAccounts({ role: 'CAREGIVER', status: 'ALL' }).subscribe((items) => {
      fixture.componentInstance.caregiverCount.set(items.length);
      fixture.detectChanges();
      expect(items.map((x) => x.full_name)).toEqual(['Lê Hoàng Nam']);
    });

    const customerReq = httpMock!.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/gateway/auth/admin/accounts' &&
        req.params.get('role') === 'CUSTOMER'
    );
    expect(customerReq.request.headers.get('Authorization')).toBe(`Bearer ${expectedToken}`);
    customerReq.flush(wrapApiResponse(MOCK_CUSTOMER_ACCOUNTS));

    const caregiverReq = httpMock!.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/gateway/auth/admin/accounts' &&
        req.params.get('role') === 'CAREGIVER'
    );
    expect(caregiverReq.request.headers.get('Authorization')).toBe(`Bearer ${expectedToken}`);
    caregiverReq.flush(wrapApiResponse(MOCK_CAREGIVER_ACCOUNTS));

    expect(fixture.componentInstance.customerCount()).toBe(2);
    expect(fixture.componentInstance.caregiverCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('2');
    expect(fixture.nativeElement.textContent).toContain('1');
  });

  it('should navigate to next route and update next view when CAREGIVER is selected', async () => {
    const fixture = TestBed.createComponent(SelectorFlowHostComponent);
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    await router.initialNavigation();
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll(
      'button[role="tab"]'
    ) as NodeListOf<HTMLButtonElement>;
    tabs[1].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.navigatedRoles).toEqual(['CAREGIVER']);
    expect(fixture.componentInstance.activeRole()).toBe('CAREGIVER');
    expect(location.path()).toBe('/admin/accounts?role=CAREGIVER');
    expect(fixture.nativeElement.textContent).toContain('Trang danh sách tài khoản');
  });
});