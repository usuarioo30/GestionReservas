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
        this.authService.getUsers().then(usuarios => {
          this.usuarios = usuarios;

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

  abrirModalEditar(usuario: Usuario): void {
    this.proyectoSeleccionado = { ...usuario };
  }


  async eliminarUsuario(id: number) {
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
      await this.authService.deleteUser(id);

      this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);

      await Swal.fire({
        title: '¡Usuario eliminado!',
        text: 'El usuario ha sido eliminado exitosamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });

    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
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
