import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email = '';
  senha = '';
  confirmarSenha = '';
  erro = '';
  sucesso = '';
  enviando = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  criarConta(): void {
    this.erro = '';
    this.sucesso = '';

    if (this.senha.length < 6) {
      this.erro = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }
    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return;
    }

    this.enviando = true;
    this.auth.register(this.email, this.senha).subscribe({
      next: (res) => {
        this.enviando = false;
        this.senha = '';
        this.confirmarSenha = '';
        this.sucesso = res.message || 'Conta criada com sucesso.';
        setTimeout(() => {
          void this.router.navigate(['/login'], {
            queryParams: { email: res.email ?? this.email }
          });
        }, 900);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando = false;
        this.senha = '';
        this.confirmarSenha = '';
        this.erro =
          err.error?.message ||
          (err.status === 409
            ? 'Já existe uma conta com este e-mail.'
            : 'Não foi possível criar a conta.');
      }
    });
  }
}
