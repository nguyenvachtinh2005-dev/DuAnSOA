import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private router = inject(Router);

  brandTitle = 'Home Care';
  sidebarCollapsed = signal(false);

  onToggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}