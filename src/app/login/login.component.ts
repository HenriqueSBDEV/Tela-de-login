import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  senha: string = '';

  entrar(): void {
    console.log('E-mail:', this.email);
    console.log('Senha:', this.senha);
  }

}
