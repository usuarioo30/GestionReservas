import { Component } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-list-usuarios',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './list-usuarios.component.html',
  styleUrl: './list-usuarios.component.css'
})
export class ListUsuariosComponent {

  usuarios: Usuario[] = []; // Lista de proyectos
  proyectoSeleccionado!: Usuario; // Proyecto seleccionado para editar
  crearProyectoForm: FormGroup; // Formulario para crear proyectos
  tieneAcceso: boolean = true;
  usuario!: Usuario;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder // Inyectar FormBuilder
  ) {
    // Inicializar el formulario para crear proyectos
    this.crearProyectoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  async ngOnInit() {
    const token = localStorage.getItem('access_token');
    const role = await this.authService.getRole(); // Obtener el rol del usuario desde el token
    console.log('User Role:', role); // Verificar el valor del rol en la consola

    if (role !== 'admin') {
      this.tieneAcceso = false; // Si no es admin, no tiene acceso
    } else {
      this.usuarios = await this.authService.getUsers()// Si es admin, cargamos los proyectos
      if (token) //Hubiese preferido no tener que ponerlo pero no encontré la manera
      this.usuario = await this.authService.getUserByMail(this.authService.decodeToken(token).email);
      
    }
  }



  // Abrir el modal para editar un proyecto
  abrirModalEditar(proyecto: Usuario): void {
    this.proyectoSeleccionado = { ...proyecto }; // Clonar el proyecto seleccionado
  }


  // Eliminar un usuario
  eliminarUsuario(id: number) {
    this.authService.deleteUser(id);
  }


  volverAReservas(): void {
    this.router.navigate(['/reservas']);
  }

}
