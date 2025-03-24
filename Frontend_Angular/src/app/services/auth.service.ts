import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

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

  logout(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem('access_token');
    
    // Redirigir al usuario al login (o página inicial)
    this.router.navigate(['/login']);
  }
}
