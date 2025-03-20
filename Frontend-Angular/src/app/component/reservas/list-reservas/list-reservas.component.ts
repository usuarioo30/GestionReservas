import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../../services/reservas.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  selector: 'app-list-reservas',
  templateUrl: './list-reservas.component.html',
  styleUrls: ['./list-reservas.component.css']
})
export class ListReservasComponent implements OnInit {
  reservas: any[] = []; // Lista de reservas

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.loadReservas();
  }

  async loadReservas(): Promise<void> {
    try {
      this.reservas = await this.reservasService.getReservas(); // Llama al servicio usando Fetch API
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
    }
  }
}
