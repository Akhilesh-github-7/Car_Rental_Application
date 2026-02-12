import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private readonly isLoginModalOpen = signal(false);
  private readonly loginModalMessage = signal<string | null>(null);

  getIsLoginModalOpen() {
    return this.isLoginModalOpen.asReadonly();
  }

  getLoginModalMessage() {
    return this.loginModalMessage.asReadonly();
  }

  openLoginModal(message?: string) {
    this.loginModalMessage.set(message || null);
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal() {
    this.isLoginModalOpen.set(false);
    this.loginModalMessage.set(null);
  }
}
