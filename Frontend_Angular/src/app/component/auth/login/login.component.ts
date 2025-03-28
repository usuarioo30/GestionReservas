import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isDarkTheme = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    const token = localStorage.getItem('access_token');

    if (token) {
      this.router.navigate(['/reservas']);
    }

    // Lógica para restaurar el tema guardado previamente (oscuro | claro)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }

    this.loadGoogleScript();
    (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
  }

  private loadGoogleScript(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  handleCredentialResponse(response: any): void {
    console.log('Token de Google recibido:', response.credential);

    this.authService.loginWithGoogle(response.credential)
      .then(res => {
        Swal.fire('Éxito', 'Inicio de sesión con Google exitoso', "success");
        localStorage.setItem("access_token", JSON.stringify(response.credential));
        this.router.navigate(['/reservas']);

      })
      .catch(err => {
        console.error('Error al iniciar sesión con Google:', err);
      });

  }


  async onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      const response = await this.authService.logIn(username, password);

      if (response.ok) {

        const token = await response.json();

        localStorage.setItem("access_token", JSON.stringify(token.access_token));

        Swal.fire('Éxito', "Sesión iniciada con éxito. Redirigiendo...", "success");

        setTimeout(() => {
          this.router.navigate(['/reservas']);
        }, 2000);

      } else {
        Swal.fire("Credenciales incorrectas");
      }


    }
  }

  private initializeGoogleAuth(): void {
    loadGapiInsideDOM().then(() => {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: '2.apps.googleusercontent.com',
        });
      });
    });
  }

  // Método para alternar el tema
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;

    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');

    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}
