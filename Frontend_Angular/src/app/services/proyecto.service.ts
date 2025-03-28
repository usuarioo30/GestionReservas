import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proyecto } from '../interfaces/proyecto';
import { Reserva } from '../interfaces/reserva';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getProyectos1(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/proyectos`);
  }

  editProyecto(id: number, proyecto: Proyecto): Observable<any> {
    return this.http.put(`${this.apiUrl}/editarProyecto/${id}`, proyecto);
  }

  deleteProyecto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarProyecto/${id}`);
  }

  addProyecto(proyecto: Omit<Proyecto, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrarProyecto`, proyecto);
  }

  async getProyectos(): Promise<Proyecto[]> {
    try {
      return await firstValueFrom(this.http.get<Proyecto[]>(`${this.apiUrl}/proyectos`));
    } catch (error) {
      console.error('Error al obtener los proyectos:', error);
      return [];
    }
  }
}
