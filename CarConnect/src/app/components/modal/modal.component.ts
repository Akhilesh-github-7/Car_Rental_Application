import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  authService = inject(AuthService);
  modalService = inject(ModalService);
  alertService = inject(AlertService);
  router = inject(Router);
  fb = inject(FormBuilder);
  scrollService = inject(ScrollService);

  activeTab: 'login' | 'register' = 'login';
  showPassword = signal(false);

  // Forms
  loginForm: FormGroup;
  registerForm: FormGroup;

  // Signals for state
  registrationSuccess = signal(false);
  registrationError = signal<string | null>(null);
  loginError = signal(false);
  isLoading = signal(false);

  // Password Strength
  passwordStrengthScore = signal(0);
  passwordStrengthLabel = computed(() => {
    const score = this.passwordStrengthScore();
    if (score === 0) return '';
    if (score < 40) return 'Weak';
    if (score < 70) return 'Medium';
    return 'Strong';
  });
  
  passwordStrengthColor = computed(() => {
    const score = this.passwordStrengthScore();
    if (score < 40) return '#e53e3e'; 
    if (score < 70) return '#d69e2e'; 
    return '#38a169'; 
  });

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm.get('password')?.valueChanges.subscribe(val => {
      this.calculatePasswordStrength(val || '');
    });
  }

  calculatePasswordStrength(password: string) {
    let score = 0;
    if (!password) {
      this.passwordStrengthScore.set(0);
      return;
    }
    if (password.length > 5) score += 20;
    if (password.length > 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    this.passwordStrengthScore.set(Math.min(100, score));
  }

  setTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.loginError.set(false);
    this.registrationError.set(null);
    this.registrationSuccess.set(false);
    this.loginForm.reset();
    this.registerForm.reset();
    this.passwordStrengthScore.set(0);
    this.showPassword.set(false);
    
    // Scroll modal content to top on tab change
    setTimeout(() => {
      this.scrollService.scrollToTopInContainer('.modal-main', 'smooth');
    }, 10);
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    
    this.isLoading.set(true);
    this.loginError.set(false);
    
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.result && response.data) {
          this.authService.setToken(response.data.token);
          const userData = { email: email, username: response.data.username };
          this.authService.storeUserData(userData);
          this.alertService.success('Login successful!');
          this.closeModal();
          this.router.navigate(['/home']);
        } else {
          this.loginError.set(true);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.loginError.set(true);
      }
    });
  }

  closeModal() {
    this.modalService.closeLoginModal();
    this.loginForm.reset();
    this.registerForm.reset();
    this.loginError.set(false);
    this.activeTab = 'login';
    this.showPassword.set(false);
    this.passwordStrengthScore.set(0);
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.result) {
            this.registrationSuccess.set(true);
            this.registrationError.set(null);
            this.registerForm.reset();
            this.passwordStrengthScore.set(0);
            setTimeout(() => {
              this.setTab('login');
            }, 2000);
          } else {
            this.registrationError.set(response.message || 'Registration failed');
            this.registrationSuccess.set(false);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.registrationError.set(err.error.message || 'Registration failed');
          this.registrationSuccess.set(false);
        }
      });
    }
  }
}
