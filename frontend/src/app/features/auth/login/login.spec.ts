import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './login';
import { Auth } from '../../../core/services/auth';
import { ApiResponse } from '../../../core/models/api.model';
import { LoginData } from '../../../core/models/auth.model';
import { Component } from '@angular/core';

describe('Login (Admin)', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let authMock: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    getRole: ReturnType<typeof vi.fn>;
    isAdminAuthenticated: ReturnType<typeof vi.fn>;
    setSession: ReturnType<typeof vi.fn>;
    extractLoginData: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    @Component({ standalone: true, template: '' })
    class DummyDashboard {}
    localStorage.clear();

    authMock = {
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn().mockReturnValue(null),
      getRole: vi.fn().mockReturnValue(null),
      isAdminAuthenticated: vi.fn().mockReturnValue(false),
      setSession: vi.fn(),
      extractLoginData: vi.fn((res) => ('data' in res && res.data ? res.data : res)),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([
          { path: 'admin/dashboard', component: DummyDashboard },
          { path: 'login', component: Login },
        ]),
        { provide: Auth, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('đăng nhập thành công với tài khoản ADMIN đang ACTIVE và lưu token', () => {
    const successResponse: ApiResponse<LoginData> = {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token: 'admin-jwt-token-ok',
        role: 'ADMIN',
        user: {
          id: 1,
          email: 'admin@homecare.vn',
          role: 'ADMIN',
          account_status: 'ACTIVE',
          email_verified: true,
        },
      },
    };

    authMock.login.mockImplementation(() => {
      localStorage.setItem('soa_admin_token', 'admin-jwt-token-ok');
      return of(successResponse);
    });

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    component.email = 'admin@homecare.vn';
    component.password = 'Admin@123';
    component.onSubmit();

    expect(authMock.login).toHaveBeenCalledWith({
      email: 'admin@homecare.vn',
      password: 'Admin@123',
    });
    expect(localStorage.getItem('soa_admin_token')).toBe('admin-jwt-token-ok');
    expect(component.errorMessage()).toBe('');
    expect(component.emailError()).toBe('');
    expect(component.isSubmitting()).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Admin đăng nhập thành công:',
      successResponse.data
    );
  });

  it('từ chối đăng nhập nếu tài khoản không có quyền ADMIN', () => {
    const customerResponse: ApiResponse<LoginData> = {
      success: true,
      data: {
        token: 'customer-token',
        role: 'CUSTOMER',
        user: {
          id: 2,
          email: 'customer@homecare.vn',
          role: 'CUSTOMER',
          account_status: 'ACTIVE',
        },
      },
    };

    authMock.login.mockReturnValue(of(customerResponse));

    component.email = 'customer@homecare.vn';
    component.password = 'Pass@123';
    component.onSubmit();

    expect(authMock.logout).toHaveBeenCalled();
    expect(component.errorMessage()).toBe(
      'Tài khoản này không có quyền truy cập trang quản trị.'
    );
  });

  it('từ chối đăng nhập nếu tài khoản không ở trạng thái ACTIVE', () => {
    const lockedResponse: ApiResponse<LoginData> = {
      success: true,
      data: {
        token: 'locked-token',
        role: 'ADMIN',
        user: {
          id: 3,
          email: 'locked@homecare.vn',
          role: 'ADMIN',
          account_status: 'LOCKED',
        },
      },
    };

    authMock.login.mockReturnValue(of(lockedResponse));

    component.email = 'locked@homecare.vn';
    component.password = 'Pass@123';
    component.onSubmit();

    expect(authMock.logout).toHaveBeenCalled();
    expect(component.errorMessage()).toBe(
      'Tài khoản hiện chưa được kích hoạt hoặc đang bị khóa.'
    );
  });

  it('hiển thị lỗi khi email sai định dạng và không gọi API', () => {
    component.email = 'ádasdasd';
    component.password = 'Pass@123';
    component.onSubmit();

    expect(authMock.login).not.toHaveBeenCalled();
    expect(component.emailError()).toBe(
      'Email không đúng định dạng (ví dụ: admin@example.com).'
    );
  });

  it('hiển thị lỗi khi API trả về 401 sai thông tin đăng nhập', () => {
    authMock.login.mockReturnValue(
      throwError(() => ({
        status: 401,
        error: {
          statusCode: 401,
          message: 'Email hoặc mật khẩu không chính xác.',
        },
      }))
    );

    component.email = 'admin@homecare.vn';
    component.password = 'wrong-password';
    component.onSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('Email hoặc mật khẩu không chính xác.');
  });
});