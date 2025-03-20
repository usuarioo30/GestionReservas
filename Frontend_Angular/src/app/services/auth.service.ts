import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000'; // Cambia esto según la URL de tu backend

  constructor() {}

  async login(username: string, password: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales incorrectas');
    }

    return response.json(); // Devuelve el token JWT
  }

  async loginWithGoogle(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/login/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al iniciar sesión con Google');
    }

    return response.json(); // Devuelve el token JWT
  }
}
