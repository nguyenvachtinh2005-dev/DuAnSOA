import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  pageTitle = 'Tổng quan hệ thống';
  pageSubtitle = 'Chúc bạn một ngày làm việc hiệu quả';
  greetingTitle = 'Xin chào, Quản trị viên!';
  greetingDescription = 'Chào mừng bạn đến với hệ thống quản trị Home Care.';
}
