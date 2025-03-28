import { Injectable } from '@angular/core';
import { Reserva } from '../interfaces/reserva';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Proyecto } from '../interfaces/proyecto';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = 'http://localhost:5000/';

  constructor(private http: HttpClient) {}

  async getReservas(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}reservas`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      throw error;
    }
  }

  async getNombreProyecto(id: number): Promise<Proyecto> { 
    try {
      const response = await fetch(`${this.apiUrl}proyectos/${id}`); 
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json(); 
    } catch (error) {
      console.error('Error al obtener el nombre del proyecto:', error);
      throw error;
    }
  }

  async addReserva(reserva: Omit<Reserva, "id">): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}registrarReserva`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Autorization': `Bearer ${localStorage.getItem('access_token')}`,
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

  async editReserva(reserva: Reserva): Promise<void> { 
    try {

      const response = await fetch(`${this.apiUrl}editarReserva/${reserva.id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reserva)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error al editar la reserva:', error);
      throw error;
    }
  }

   deleteReserva(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/eliminarReserva/${id}`);
  }
}