import { Component } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';

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
  async eliminarUsuario(id: number) {

    //window.confirm("¿Estás seguro de que deseas eliminar este usuario?"); //Nativo de js para eliminar
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
  
    if (!confirmacion.isConfirmed) {
      return; // Si el usuario cancela, no se ejecuta la eliminación
    }

    try {
      const eliminado = await this.authService.deleteUser(id);
      if (eliminado) {
        // Filtra el usuario eliminado del array
        this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
      } else {
        console.error("Ha ocurrido un error al eliminar el usuario");
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  }
  


  volverAReservas(): void {
    this.router.navigate(['/reservas']);
  }

}
