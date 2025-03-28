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
      return;
    }

    try {
      const eliminado = await this.authService.deleteUser(id);
      if (eliminado) {
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
