import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = 'http://localhost:5000/reservas'; // URL del endpoint de tu backend

  constructor() {}

  async getReservas(): Promise<any[]> {
    try {
      const response = await fetch(this.apiUrl); // Realiza la solicitud HTTP con Fetch API
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json(); // Devuelve los datos en formato JSON
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      throw error;
    }
  }
}