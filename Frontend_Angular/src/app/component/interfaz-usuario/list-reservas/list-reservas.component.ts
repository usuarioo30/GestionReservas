import { Component, Input, OnChanges, SimpleChanges, OnInit, inject, Renderer2 } from '@angular/core';
import { ReservasService } from '../../../services/reservas.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Reserva } from '../../../interfaces/reserva';
import { jwtDecode } from 'jwt-decode';
import { Showreserva } from '../../../interfaces/showreserva';
import { ProyectoService } from '../../../services/proyecto.service';
import { Proyecto } from '../../../interfaces/proyecto';
import { Usuario } from '../../../interfaces/usuario';
import Swal from 'sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule,
    SweetAlert2Module],
  selector: 'app-list-reservas',
  templateUrl: './list-reservas.component.html',
  styleUrls: ['./list-reservas.component.css']
})
export class ListReservasComponent implements OnInit, OnChanges {

  reservas: Showreserva[] = [];
  showReservas: Showreserva[] = [];
  isDarkTheme = false;
  nombreProyecto: string = '';
  nombreUsuario: string = '';
  @Input() sala?: string;
  email: string | null = null;
  id!: number | undefined;
  role: string | null = null;
  minDateTime: string = '';
  dateActual: string = '';
  proyectos!: Proyecto[];
  usuarios!: Usuario[];
  constructor(private reservasService: ReservasService,
              private authService: AuthService,
              private router: Router,
              private renderer: Renderer2
  ) {

    let token = localStorage.getItem('access_token');
    if(token) {
      const decodedToken: any = jwtDecode(token);
      console.log(decodedToken); //getUserByMail
      this.waitFetch(decodedToken.email);

      // if (userId) {
      //   this.id =  Number.parseInt(userId);
      //   console.log(this.id);
      // }

    }

  }

  private fb: FormBuilder = inject(FormBuilder);
  private proyectoService = inject(ProyectoService);

  reservation: FormGroup = this.fb.group({
    email: [''], // Campo email agregado
    fechaHoraInicio: ['', [Validators.required]],
    duracion: ['', [Validators.required, Validators.min(1)]],
    proyectoAsociado: ['', [Validators.required,Validators.nullValidator]],
    descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(140)]],
    idUsario: [this.id]
  });

  editReservation: FormGroup = this.fb.group({
    id: [''],
    email: [''], // Campo email agregado
    fechaHoraInicio: ['', [Validators.required]],
    duracion: ['', [Validators.required, Validators.min(1)]],
    proyectoAsociado: ['', [Validators.required,Validators.nullValidator]],
    descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(140)]],
    idUsario: [this.id]
  });

  async ngOnInit(): Promise<void> {
    const token = localStorage.getItem('access_token');

    this.updateMinDateTime();
    this.proyectos = await this.proyectoService.getProyectos();
    this.usuarios = await this.authService.getUsers();
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16);

    this.email = this.authService.getEmail();
    if (this.email) {
      await this.waitFetch(this.email);
      this.role = await this.getRole(this.id!);

    }
    if(!token) {
      this.router.navigate(['/login']);
    }


    // Lógica para restaurar el tema guardado previamente (oscuro | claro)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }


    // Carga inicial de las reservas
    await this.loadReservas();
    this.filterReservas(this.nombreProyecto); // Filtra las reservas según el valor inicial de sala
  }

  // Método para actualizar la fecha y hora mínima
  updateMinDateTime(): void {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // Formato 'YYYY-MM-DDTHH:mm'
    this.minDateTime = localDateTime;
    this.dateActual = localDateTime.slice(0, 10); // Formato 'YYYY-MM-DD'
  }

  // Método para verificar si la fecha seleccionada es hoy
  isToday(selectedDate: string): boolean {
    return selectedDate === this.dateActual;
  }

  // Método para manejar cambios en la fecha seleccionada
  onDateTimeChange(event: any): void {
    const selectedDateTime = event.target.value;
    const selectedDate = selectedDateTime.slice(0, 10); // Extraer solo la fecha (YYYY-MM-DD)

    const minDateTimeToDate = new Date(this.minDateTime);
    const selectedDateTimeToDate = new Date(selectedDateTime);

    if (this.isToday(selectedDate)) {
      // Si es hoy, actualizar minDateTime con la hora actual
      this.updateMinDateTime();
    } else {

      if (selectedDateTimeToDate < minDateTimeToDate) {
        alert('La fecha y hora seleccionada no puede ser anterior a la fecha y hora actual');
      } else {

        this.minDateTime = `${selectedDate}T00:00`;
      }

    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detecta cambios en el valor de @Input() sala
    if (changes['sala'] && !changes['sala'].isFirstChange()) {
      this.filterReservas(this.nombreProyecto); // Filtra las reservas cuando cambia el valor de sala
    }
  }

  async getRole(id: number) {
    const response = await this.authService.getUser(id);

    return response.roles;
  }


  async waitFetch(email: string): Promise<any> {
    try {
      const user = await this.authService.getUserByMail(email);
      console.log(user); // Devuelve el resultado resuelto
      this.id = user.id;
    } catch (error) {
      console.error('Error al obtener el usuario por email:', error);
      throw error; // Lanza el error para manejarlo en el lugar donde se llama
    }
  }

  async loadReservas(): Promise<void> {
    try {
      let reservas = await this.reservasService.getReservas();

      this.showReservas = await Promise.all(
        reservas.map(async reserva => {
          let response = await this.authService.getUser(reserva.idUsuario);
          let nombreProyecto = await this.reservasService.getNombreProyecto(reserva.proyectoAsociado);
          reserva.owner = response.username; // Asigna el nombre del usuario al campo 'owner'
          reserva.email = response.email;
          reserva.proyectoAsociado = nombreProyecto.nombre;
          return reserva;
        })
      );
      // Llama al servicio para obtener las reservas
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
    }
  }

  filterReservas(nombreproyecto: string, nombreusuario?: string): void {


    switch (this.sala) {
      case 'upper':

        if (nombreproyecto) {
          this.reservas = this.showReservas.filter(reserva => reserva.sala === 'arriba' && reserva.proyectoAsociado.toLowerCase().includes(nombreproyecto.toLowerCase().trim()));
          break;
        }

        if (nombreusuario) {
          this.reservas = this.showReservas.filter(reserva => reserva.sala === 'arriba' && reserva.proyectoAsociado.toLowerCase().includes(nombreproyecto.toLowerCase().trim()) && reserva.owner.toLowerCase().includes(nombreusuario.toLowerCase().trim()));
          break;
        }

        this.reservas = this.showReservas.filter(reserva => reserva.sala === 'arriba');
        break;
      case 'lower':
        if (nombreproyecto) {
          this.reservas = this.showReservas.filter(reserva => reserva.sala === 'abajo' && reserva.proyectoAsociado.toLowerCase().includes(nombreproyecto.toLowerCase().trim()));
          console.log(this.reservas);
          break;
        }

        if (nombreusuario) {
          this.reservas = this.showReservas.filter(reserva => reserva.sala === 'arriba' && reserva.proyectoAsociado.toLowerCase().includes(nombreproyecto.toLowerCase().trim()) && reserva.owner.toLowerCase().includes(nombreusuario.toLowerCase().trim()));
          break;
        }

        this.reservas = this.showReservas.filter(reserva => reserva.sala === 'abajo');
        break;
      default:
        if (nombreproyecto) {
          this.reservas = this.showReservas.filter(reserva => reserva.proyectoAsociado.toLowerCase().includes(nombreproyecto.toLowerCase().trim()));
          console.log("Probamos".toLowerCase().trim().includes(nombreproyecto.toLowerCase().trim()));
          break;
        }

        else if (nombreusuario) {
          this.reservas = this.showReservas.filter(reserva => reserva.sala === 'arriba' && reserva.proyectoAsociado.toLowerCase().includes(nombreproyecto.toLowerCase().trim()) && reserva.owner.toLowerCase().includes(nombreusuario.toLowerCase().trim()));
          break;
        }

        else {
          this.reservas = this.showReservas; // Si el valor no es válido, muestra todas las reservas
          break;

        }
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

      await this.reservasService.addReserva(reserva);

      Swal.fire('Éxito', 'Reserva realizada con éxito', 'success');

      await this.loadReservas();
      this.filterReservas(this.nombreProyecto);

      this.reservation.reset({
        email: this.email
      });

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
      this.editReservation.controls['email'].setValue(reserva.email); // Cargar el correo original
      this.editReservation.controls['fechaHoraInicio'].setValue(reserva.fechaHoraInicio);
      this.editReservation.controls['duracion'].setValue(reserva.duracion);
      this.editReservation.controls['proyectoAsociado'].setValue(reserva.proyectoAsociado);
      this.editReservation.controls['descripcion'].setValue(reserva.descripcion);
      this.editReservation.controls['idUsuario'].setValue(reserva.idUsuario);


    } else {
      Swal.fire('Error', `No se encontró la reserva con ID
      ${id}`, 'error');
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
        idUsuario: this.editReservation.value.idUsuario,
      };

      await this.reservasService.editReserva(reserva);
      Swal.fire('Éxito', 'Reserva editada con éxito', 'success');
      await this.loadReservas();
      this.filterReservas(this.nombreProyecto);
    } else {
      Swal.fire('Error', 'El formulario de edición no es válido', 'error');
      this.editReservation.markAllAsTouched();
    }
  }

  deleteReserva(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservasService.deleteReserva(id).subscribe(
          async () => {
            this.reservas = this.reservas.filter(reserva => reserva.id !== id);
            await Swal.fire('Eliminado', 'Reserva eliminada con éxito', 'success');
            await this.loadReservas();
            this.filterReservas(this.nombreProyecto);
          },
          () => {
            Swal.fire('Error', 'Error al eliminar la reserva', 'error');
          }
        );
      }
    });
  }

  // Método para alternar el tema
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;

    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');

    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}
