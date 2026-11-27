import { Component, model } from '@angular/core';

@Component({
  selector: 'app-password-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="password-toggle-btn"
      (click)="toggle()"
      [attr.aria-label]="visible() ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
      [attr.title]="visible() ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
    >
      @if (!visible()) {
        <!-- Đang ẩn mật khẩu: con mắt có đường gạch chéo giống ảnh -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      } @else {
        <!-- Đang hiện mật khẩu: con mắt mở -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      }
    </button>
  `,
  styles: [`
    .password-toggle-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #4b5563;
      cursor: pointer;
      transition: color 0.15s ease, background-color 0.15s ease;
    }

    .password-toggle-btn:hover {
      color: #111827;
      background-color: #f3f4f6;
    }

    .password-toggle-btn:focus-visible {
      outline: 2px solid #0d9488;
      outline-offset: 1px;
    }
  `],
})
export class PasswordToggle {
  visible = model<boolean>(false);

  toggle(): void {
    this.visible.update((current) => !current);
  }
}