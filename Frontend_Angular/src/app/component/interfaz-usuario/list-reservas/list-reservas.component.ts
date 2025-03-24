import { Component, Input, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { ReservasService } from '../../../services/reservas.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-list-reservas',
  templateUrl: './list-reservas.component.html',
  styleUrls: ['./list-reservas.component.css']
})
export class ListReservasComponent implements OnInit, OnChanges {
  reservas: any[] = []; // Lista de reservas filtradas
  showReservas: any[] = []; // Lista completa de reservas
  @Input() sala?: string; // Sala seleccionada (recibida como input)
  username: string | null = null;

  constructor(private reservasService: ReservasService,
        private authService: AuthService,
        private router: Router
  ) {}

  private fb: FormBuilder = inject(FormBuilder);

  reservation: FormGroup = this.fb.group({
    date: ['', [Validators.required]],
    duration: ['', [Validators.required, Validators.min(1)]],
    project: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(140)]],
  });

  async ngOnInit(): Promise<void> {
    const token = localStorage.getItem('access_token');

    this.username = this.authService.getEmail();

    if(!token) {
      this.router.navigate(['/login']);
    }

    // Carga inicial de las reservas
    await this.loadReservas();
    this.filterReservas(); // Filtra las reservas según el valor inicial de sala
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detecta cambios en el valor de @Input() sala
    if (changes['sala'] && !changes['sala'].isFirstChange()) {
      this.filterReservas(); // Filtra las reservas cuando cambia el valor de sala
    }
  }

  async loadReservas(): Promise<void> {
    try {
      this.showReservas = await this.reservasService.getReservas(); // Llama al servicio para obtener las reservas
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
    }
  }

  filterReservas(): void {
    if (!this.sala) {
      this.reservas = this.showReservas; // Si no hay sala, muestra todas las reservas
      return;
    }

    switch (this.sala) {
      case 'upper':
        this.reservas = this.showReservas.filter(reserva => reserva.sala === 'arriba');
        break;
      case 'lower':
        this.reservas = this.showReservas.filter(reserva => reserva.sala === 'abajo');
        break;
      default:
        this.reservas = this.showReservas; // Si el valor no es válido, muestra todas las reservas
        break;
    }
  }

  inValidField(field: string):boolean {
    return this.reservation?.controls[field].invalid && this.reservation?.controls[field].touched;
  }

  submitReservation(): void {
    if (this.reservation.valid) {
        alert('Reserva realizada con éxito');
    } else {
      this.reservation.markAllAsTouched();
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

// Método para eliminar una reserva según el `id`
  deleteReserva(id: number): void {
    const confirmarEliminacion = confirm('¿Estás seguro de que deseas eliminar esta reserva?');
    if (confirmarEliminacion) {
      // Filtremos la lista para eliminar el elemento seleccionado
      this.reservas = this.reservas.filter(reserva => reserva.id !== id);
      console.log(`Reserva con id ${id} eliminada`);
    }
  }

  editReserva(id: number): void {
    // Encuentra la reserva a editar
    const reserva = this.reservas.find(res => res.id === id);

    if (reserva) {
      // Redirige al formulario de crear/editar reservas pasando el ID
      this.router.navigate(['/editarReservaModal', id]);
    } else {
      console.error(`No se encontró la reserva con ID ${id}`);
    }
  }
}
