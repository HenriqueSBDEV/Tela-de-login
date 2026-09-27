import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  email = '';
  erro = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (me) => {
        this.email = me.email;
      },
      error: () => {
        this.erro = 'Não foi possível carregar o perfil. Faça login novamente.';
        this.auth.logout();
        void this.router.navigate(['/login']);
      }
    });
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
