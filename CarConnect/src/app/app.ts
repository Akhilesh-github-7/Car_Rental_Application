import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { ModalService } from './services/modal.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ModalComponent } from './components/modal/modal.component';
import { FooterComponent } from './components/footer/footer.component';
import { AlertComponent } from './components/alert/alert.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, NavbarComponent, ModalComponent, FooterComponent, AlertComponent, ScrollToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('CarConnect');
  
  authService = inject(AuthService);
  modalService = inject(ModalService);

  constructor() {}

  ngOnInit() {
  }
}
