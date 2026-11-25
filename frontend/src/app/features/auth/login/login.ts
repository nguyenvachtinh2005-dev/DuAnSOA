import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { ApiErrorResponse } from '../../../core/models/api.model';
import { PasswordToggle } from '../../../shared/components/password-toggle/password-toggle';
import { validateEmailValue } from '../../../shared/utils/email-validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PasswordToggle],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  brandTitle = 'Home Care';
  email = '';
  password = '';
  showPassword = signal(false);
  isSubmitting = signal(false);
  emailError = signal('');
  errorMessage = signal('');

  onEmailInput(): void {
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    const trimmed = this.email.trim();
    if (!trimmed) {
      this.emailError.set('');
      return;
    }

    // Hiển thị lỗi ngay khi vừa ngừng gõ ~400ms (xem như nhập xong một lượt)
    this.typingTimer = setTimeout(() => {
      this.emailError.set(validateEmailValue(this.email));
    }, 400);
  }

  onEmailBlur(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    if (!this.email.trim()) {
      this.emailError.set('');
      return;
    }

    this.emailError.set(validateEmailValue(this.email));
  }

  onSubmit(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    this.errorMessage.set('');
    const emailValidationMsg = validateEmailValue(this.email);
    this.emailError.set(emailValidationMsg);

    const trimmedEmail = this.email.trim();
    if (!trimmedEmail || !this.password.trim()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    if (emailValidationMsg) {
      return;
    }

    this.isSubmitting.set(true);

    this.auth.login({ email: trimmedEmail, password: this.password }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);

        if ('success' in res && res.success === false) {
          this.auth.logout();
          this.errorMessage.set(res.message || 'Đăng nhập thất bại.');
          return;
        }

        const data = this.auth.extractLoginData(res);
        const role = data.role ?? data.user?.role;
        const accountStatus = data.user?.account_status;

        if (role && role !== 'ADMIN') {
          this.auth.logout();
          this.errorMessage.set('Tài khoản này không có quyền truy cập trang quản trị.');
          return;
        }

        if (accountStatus && accountStatus !== 'ACTIVE') {
          this.auth.logout();
          this.errorMessage.set('Tài khoản hiện chưa được kích hoạt hoặc đang bị khóa.');
          return;
        }

        console.log('Admin đăng nhập thành công:', data);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const apiErr = err?.error as ApiErrorResponse | undefined;
        const msg = Array.isArray(apiErr?.message)
          ? apiErr.message.join(', ')
          : apiErr?.message;
        this.errorMessage.set(msg || 'Email hoặc mật khẩu không chính xác.');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }
}