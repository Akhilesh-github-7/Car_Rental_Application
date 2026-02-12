import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService);
  modalService = inject(ModalService);
  alertService = inject(AlertService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  isMenuOpen = signal(false);
  isUserDropdownOpen = signal(false);

  // Computed signals or simple getters would also work, but we'll stick to direct service access in template or wrappers
  isLoggedIn = this.authService.isLoggedIn.bind(this.authService);
  
  get user() {
    return this.authService.getUserData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    this.isUserDropdownOpen.set(false);
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen.update(v => !v);
  }

  openLogin() {
    this.modalService.openLoginModal();
    this.closeMenu();
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    this.alertService.info('You have been logged out.');
    this.router.navigate(['/home']);
  }

  // Protected route handlers
  handleProtectedLink(event: Event, route: string) {
    if (!this.authService.isLoggedIn()) {
      event.preventDefault();
      let message = 'Login to continue';
      if (route === 'my-booking') message = 'Login to view your bookings';
      if (route === 'my-hosted-bookings') message = 'Login to view bookings for your cars';
      
      this.modalService.openLoginModal(message);
      this.closeMenu();
    }
    // If logged in, routerLink handles it
  }
}
