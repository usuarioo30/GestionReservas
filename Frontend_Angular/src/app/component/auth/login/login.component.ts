import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
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

  ngOnInit(): void {
    this.initializeGoogleAuth();
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      // Lógica para iniciar sesión con credenciales propias
    }
  }

  async loginWithGoogle() {
    const authInstance = gapi.auth2.getAuthInstance();
    const googleUser = await authInstance.signIn();
    const idToken = googleUser.getAuthResponse().id_token;

    try {
      const response = await this.authService.loginWithGoogle(idToken);
      localStorage.setItem('access_token', response.access_token); // Guarda el token JWT
      this.router.navigate(['/dashboard']); // Redirige al dashboard
    } catch (error) {
      alert('Error al iniciar sesión con Google');
    }
  }

  private initializeGoogleAuth(): void {
    loadGapiInsideDOM().then(() => {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: '2.apps.googleusercontent.com', // Reemplaza con tu Client ID
        });
      });
    });
  }
}
