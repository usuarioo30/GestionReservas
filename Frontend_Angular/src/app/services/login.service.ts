import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = "http://127.0.0.1:5000/login";

  constructor() { }

  async logIn(username: string, password: string) {

    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: username, password: password})
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    return response.json();

  }
}
