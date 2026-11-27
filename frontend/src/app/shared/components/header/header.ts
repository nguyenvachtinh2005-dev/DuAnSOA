import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  brandTitle = input<string>('Home Care');
  userName = input<string>('Quản trị viên');
  userRole = input<string>('Quản trị viên');
  showMenuToggle = input<boolean>(true);
  showProfile = input<boolean>(true);
  menuToggle = output<void>();
}