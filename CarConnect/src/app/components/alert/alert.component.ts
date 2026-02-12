import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  alertService = inject(AlertService);
  alerts = this.alertService.getAlerts();
  confirmOptions = this.alertService.getConfirmOptions();

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }

  removeAlert(id: number) {
    this.alertService.removeAlert(id);
  }

  onConfirm(result: boolean) {
    this.alertService.closeConfirm(result);
  }
}
