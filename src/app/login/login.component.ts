import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  enviando = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  entrar(): void {
    this.erro = '';
    this.enviando = true;

    this.auth.login(this.email, this.senha).subscribe({
      next: () => {
        this.senha = '';
        this.enviando = false;
        void this.router.navigate(['/home']);
      },
      error: () => {
        this.senha = '';
        this.enviando = false;
        this.erro = 'E-mail ou senha inválidos.';
      }
    });
  }
}
