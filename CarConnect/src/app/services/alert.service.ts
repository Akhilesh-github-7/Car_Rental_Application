import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly alerts = signal<Alert[]>([]);
  private readonly confirmOptions = signal<ConfirmOptions | null>(null);
  private nextId = 0;

  getAlerts() {
    return this.alerts.asReadonly();
  }

  getConfirmOptions() {
    return this.confirmOptions.asReadonly();
  }

  showAlert(message: string, type: AlertType = 'info', duration = 5000) {
    const id = this.nextId++;
    const newAlert: Alert = { id, message, type };
    
    this.alerts.update(currentAlerts => [...currentAlerts, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeAlert(id);
      }, duration);
    }
  }

  success(message: string, duration?: number) {
    this.showAlert(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.showAlert(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.showAlert(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    this.showAlert(message, 'warning', duration);
  }

  removeAlert(id: number) {
    this.alerts.update(currentAlerts => currentAlerts.filter(a => a.id !== id));
  }

  confirm(options: { title?: string, message: string, confirmText?: string, cancelText?: string }): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmOptions.set({
        title: options.title || 'Confirm Action',
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        resolve
      });
    });
  }

  closeConfirm(result: boolean) {
    const current = this.confirmOptions();
    if (current) {
      current.resolve(result);
      this.confirmOptions.set(null);
    }
  }
}
