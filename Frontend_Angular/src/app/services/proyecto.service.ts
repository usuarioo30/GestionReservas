import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Proyecto } from '../interfaces/proyecto';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  private baseUrl = 'http://localhost:5000/';

  constructor(private http: HttpClient) {}

  async getProyectos(): Promise<Proyecto[]> {
    try {
      return await firstValueFrom(this.http.get<Proyecto[]>(`${this.baseUrl}proyectos`));
      //firstValueFrom() convierte un Observable en una Promise
    } catch (error) {
      console.error('Error al obtener los proyectos:', error);
      return [];
    }
  }
}
