import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      try {
        const response = await this.authService.login(username, password);
        localStorage.setItem('access_token', response.access_token);
        alert('Credenciales correcta');
        // this.router.navigate(['/dashboard']);
      } catch (error) {
        alert('Credenciales incorrectas');
      }
    }
  }

  async loginWithGoogle() {
    try {
      const response = await this.authService.loginWithGoogle();
      localStorage.setItem('access_token', response.access_token);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert('Error al iniciar sesión con Google');
    }
  }
}
