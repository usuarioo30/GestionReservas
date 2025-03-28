import { Component, OnInit } from '@angular/core';
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
export class ListUsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  proyectoSeleccionado!: Usuario;
  crearProyectoForm: FormGroup;
  tieneAcceso: boolean = true;
  usuario!: Usuario;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Inicializar el formulario para crear proyectos
    this.crearProyectoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('access_token');

    this.authService.getRole().then(role => {
      console.log('User Role:', role);

      if (role !== 'admin') {
        this.tieneAcceso = false;
      } else {
        // Obtener todos los usuarios, no solo los admins
        this.authService.getUsers().then(usuarios => {
          this.usuarios = usuarios;

          // Obtener el usuario si el token existe
          if (token) {
            this.authService.getUserByMail(this.authService.decodeToken(token).email).then(usuario => {
              this.usuario = usuario;
            }).catch(error => {
              console.error('Error al obtener el usuario:', error);
            });
          }
        }).catch(error => {
          console.error('Error al obtener los usuarios:', error);
        });
      }
    }).catch(error => {
      console.error('Error al obtener el rol:', error);
    });
  }



  // Abrir el modal para editar un usuario
  abrirModalEditar(usuario: Usuario): void {
    this.proyectoSeleccionado = { ...usuario };
  }


  async eliminarUsuario(id: number) {
    // Muestra la alerta de confirmación utilizando SweetAlert2
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

    // Si el usuario cancela la acción, no se hace nada
    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      // Llamada al servicio para eliminar el usuario
      await this.authService.deleteUser(id);

      // Eliminar el usuario de la lista localmente
      this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);

      // Mostrar un mensaje de éxito con SweetAlert
      await Swal.fire({
        title: '¡Usuario eliminado!',
        text: 'El usuario ha sido eliminado exitosamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });

    } catch (error) {
      console.error("Error al eliminar el usuario:", error);

      // Mostrar un mensaje de error si ocurre algún problema
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al intentar eliminar el usuario.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  }



  volverAReservas(): void {
    this.router.navigate(['/reservas']);
  }

}
