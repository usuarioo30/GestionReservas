import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000'; // URL del backend
  private apiUrl1 = "http://127.0.0.1:5000/login";


  constructor(private router: Router) {}

  //Método de iniciar sesión, es llamado cuando el formulario es válido
  async logIn(username: string, password: string) {

    //Llamada a la api para iniciar sesión
    const response = await fetch(`${this.apiUrl1}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: username, password: password})
    });

    return response //Devolvemos la promesa

  }

  // Método para obtener el nombre de usuario desde el token
  getEmail(): string | null {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        // Decodificar el token JWT
        const decoded: any = jwtDecode(token);

        // Retornar el nombre de usuario desde el payload del token
        return decoded.email || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
        return null;
      }
    }
    return null;
  }

  async getUser(id: number) {
    const response = await fetch(`${this.apiUrl}/usuarios/${id}`)

    if (!response.ok) {
      throw new Error('Error al obtener el usuario');
    }

    return response.json();

  }

  async loginWithGoogle(response: any) {
    const fetchResponse = await fetch(`${this.apiUrl}/api/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: response.email })
    });

    return fetchResponse.json();
  }

  async registerUser(user: Omit<Usuario, "id">): Promise<Usuario> {
    console.log("He entrado aquí con", user);
    const response = await fetch(`${this.apiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Error al registrar el usuario');
    }

    return await response.json();

  }

  logout(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem('access_token');

    // Redirigir al usuario al login (o página inicial)
    this.router.navigate(['/login']);
  }

  /**
   *
   * @param token El token JWT
   * @returns el payload del token decodificado
   */
  decodeJwtResponse(token: string) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
}
