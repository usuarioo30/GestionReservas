import {Component, OnInit, Renderer2} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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

    if(token) {
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
        //console.log('Inicio de sesión con Google exitoso:', res);
        alert('Inicio de sesión con Google exitoso');
        localStorage.setItem("access_token", JSON.stringify(response.credential));
        this.router.navigate(['/reservas']);
        // Redirige al usuario o realiza alguna acción

      })
      .catch(err => {
        console.error('Error al iniciar sesión con Google:', err);
      });

  }


  async onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      // Lógica para iniciar sesión con credenciales propias

      const response = await this.authService.logIn(username, password);

      if (response.ok) { //Comprobamos la respuesta de la API

        const token = await response.json();

        localStorage.setItem("access_token", JSON.stringify(token.access_token)); // Almacenar token

        alert("Sesión iniciada con éxito. Redirigiendo en 2 seg..."); //Si la respuesta es correcta, mostramos un mensaje de éxito

        setTimeout(() => {
          this.router.navigate(['/reservas']); // Redirige a la nueva ruta
        }, 2000);

      } else {
        alert("Credenciales incorrectas"); //Si la respuesta es incorrecta, mostramos un mensaje de error
      }


    }
  }

  async loginWithGoogle(response: any) {
    // const authInstance = gapi.auth2.getAuthInstance();
    // const googleUser = await authInstance.signIn();
    // const idToken = googleUser.getAuthResponse().id_token;

    // try {
    //   const response = await this.authService.loginWithGoogle(idToken);
    //   localStorage.setItem('access_token', response.access_token); // Guarda el token JWT
    //   this.router.navigate(['/dashboard']); // Redirige al dashboard
    // } catch (error) {
    //   alert('Error al iniciar sesión con Google');
    // }

    const responsePayload = this.authService.decodeJwtResponse(response.credential);

    const data = await this.authService.loginWithGoogle(responsePayload);

    if (data.exists) {
      // Guardar sesión si el usuario existe
      document.cookie = `auth=loggedIn; path=/; max-age=3600`;
      localStorage.setItem('userEmail', responsePayload.email);
      localStorage.setItem('userRole', data.role);
      alert(`success ${data.message}`);

      setTimeout(() => {
          window.location.href = "../leaks.html";
      }, 500);
  } else {
    alert("error. El correo no esta registrado. Contacta con soporte.");
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
