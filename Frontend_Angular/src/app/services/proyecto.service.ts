import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proyecto } from '../interfaces/proyecto';
import { Reserva } from '../interfaces/reserva';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = 'http://localhost:5000'; // URL base del backend

  constructor(private http: HttpClient) {}

  // Obtener todos los proyectos
  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/proyectos`);
  }

  // Editar un proyecto
  editProyecto(id: number, proyecto: Proyecto): Observable<any> {
    return this.http.put(`${this.apiUrl}/editarProyecto/${id}`, proyecto);
  }

  // Eliminar un proyecto
  deleteProyecto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarProyecto/${id}`);
  }

  addProyecto(proyecto: Omit<Proyecto, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrarProyecto`, proyecto);
  }
}
