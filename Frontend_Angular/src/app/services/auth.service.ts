import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000'; // URL del backend

  constructor() {}

  async loginWithGoogle(idToken: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/login/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (!response.ok) {
      throw new Error('Error al iniciar sesión con Google');
    }

    return response.json(); // Devuelve el token JWT
  }
}
