import { Injectable } from '@angular/core';
import { Reserva } from '../interfaces/reserva';

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

  async addReserva(reserva: Omit<Reserva, "id">): Promise<void> {
    console.log(localStorage.getItem('access_token'));
    try {
      const response = await fetch("http://localhost:5000/registrarReserva", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Autorization': `Bearer ${localStorage.getItem('access_token')}`, // Añade el token JWT a la cabecera
        },
        body: JSON.stringify(reserva),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al añadir la reserva:', error);
      throw error;
    }
  }
}