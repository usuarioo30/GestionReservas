import { Component, Input, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { ReservasService } from '../../../services/reservas.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Reserva } from '../../../interfaces/reserva';
import { jwtDecode } from 'jwt-decode';

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
  email: string | null = null;
  id!: number | undefined;
  constructor(private reservasService: ReservasService,
        private authService: AuthService,
        private router: Router
  ) {

    let token = localStorage.getItem('access_token');
    if(token) { 
      let userId = jwtDecode(token)?.sub;
      if (userId) {
        this.id =  Number.parseInt(userId);
        console.log(this.id);
      }
      
    }

  }

  private fb: FormBuilder = inject(FormBuilder);

  reservation: FormGroup = this.fb.group({
    email: [''], // Campo email agregado
    fechaHoraInicio: ['', [Validators.required]],
    duracion: ['', [Validators.required, Validators.min(1)]],
    proyectoAsociado: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(140)]],
    idUsario: [this.id]
  });

  editReservation: FormGroup = this.fb.group({
    id: [''],
    email: [''], // Campo email agregado
    fechaHoraInicio: ['', [Validators.required]],
    duracion: ['', [Validators.required, Validators.min(1)]],
    proyectoAsociado: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(140)]],
    idUsario: [this.id]
  });

  async ngOnInit(): Promise<void> {
    const token = localStorage.getItem('access_token');

    this.email = this.authService.getEmail();

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

  inValidField(field: string): boolean {
    return this.reservation?.controls[field]?.invalid && this.reservation?.controls[field]?.touched;
  }

  inValidFieldEdit(field: string): boolean {
    return this.editReservation?.controls[field]?.invalid;
  }

  private formatearFecha = (fecha: string): string => {
    return fecha.replace("T", " ") + ":00";
  };

  async submitReservation() {
    if (this.reservation.valid && this.id) {
      const reserva: Omit<Reserva, "id"> = {
        sala: this.sala === "upper" ? "arriba" : "abajo",
        fechaHoraInicio: this.formatearFecha(this.reservation.value.fechaHoraInicio),
        duracion: this.reservation.value.duracion,
        proyectoAsociado: this.reservation.value.proyectoAsociado,
        descripcion: this.reservation.value.descripcion,
        idUsuario: this.id
      };

      console.log(reserva); //Esto es para ver que estamos enviando los datos correctos

      await this.reservasService.addReserva(reserva);

      alert('Reserva realizada con éxito');

      await this.loadReservas();
      this.filterReservas();

      this.reservation.reset();

    } else {
      this.reservation.markAllAsTouched();
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  //Método para obtener los datos de la reserva a editar
  editReserva(id: number): void {
    // Encuentra la reserva a editar
    const reserva = this.reservas.find(res => res.id === id);

    if (reserva) {

      // Asigna los valores de la reserva a los campos del formulario
      this.editReservation.controls['id'].setValue(reserva.id);
      this.editReservation.controls['email'].setValue(this.email);
      this.editReservation.controls['fechaHoraInicio'].setValue(reserva.fechaHoraInicio);
      this.editReservation.controls['duracion'].setValue(reserva.duracion);
      this.editReservation.controls['proyectoAsociado'].setValue(reserva.proyectoAsociado);
      this.editReservation.controls['descripcion'].setValue(reserva.descripcion);
      this.editReservation.controls['idUsuario'].setValue(reserva.idUsuario);
      

    } else {
      console.error(`No se encontró la reserva con ID ${id}`);
    }
  }

  async editReservaSubmit() {
    if (this.editReservation.valid) {
      const reserva: Reserva = {
        id: this.editReservation.value.id,
        sala: this.sala === 'upper' ? 'arriba' : 'abajo',
        fechaHoraInicio: this.editReservation.value.fechaHoraInicio,
        duracion: this.editReservation.value.duracion,
        proyectoAsociado: this.editReservation.value.proyectoAsociado,
        descripcion: this.editReservation.value.descripcion,
        idUsuario: this.editReservation.value.idUsuario
      };

      console.log(reserva);

      await this.reservasService.editReserva(reserva);

      alert('Reserva editada con éxito');
      await this.loadReservas();
      this.filterReservas();
    }
  }

  deleteReserva(id: number): void {
    const confirmarEliminacion = confirm('¿Estás seguro de que deseas eliminar esta reserva?');
    if (confirmarEliminacion) {
      // Llamar al servicio para eliminar la reserva en la base de datos
      this.reservasService.deleteReserva(id).subscribe(
        async () => {
          // Si la eliminación es exitosa, eliminamos la reserva de la lista
          this.reservas = this.reservas.filter(reserva => reserva.id !== id);
          console.log(`Reserva con id ${id} eliminada correctamente`);
  
          // Opcional: Mostrar un mensaje de éxito
          alert('Reserva eliminada con éxito');

          window.location.reload(); // Recarga la página para actualizar la lista de reservas
        },
        (error) => {
          // Si ocurre un error, muestra un mensaje de error
          console.error('Error al eliminar la reserva', error);
          alert('Hubo un error al eliminar la reserva');
        }
      );
    }
  }
}
