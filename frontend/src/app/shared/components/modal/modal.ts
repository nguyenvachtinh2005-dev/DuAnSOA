import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  open = input<boolean>(false);
  title = input<string>('');
  maxWidth = input<string>('480px');
  showFooter = input<boolean>(false);
  closeOnBackdrop = input<boolean>(true);
  closed = output<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }
}