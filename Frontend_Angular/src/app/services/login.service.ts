import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = "http://127.0.0.1:5000/login";

  constructor() { }

  //Método de iniciar sesión, es llamado cuando el formulario es válido
  async logIn(username: string, password: string) {

    //Llamada a la api para iniciar sesión
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: username, password: password})
    });

    return response //Devolvemos la promesa

  }
}
