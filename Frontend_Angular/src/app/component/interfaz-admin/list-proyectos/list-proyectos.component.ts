import { Component, OnInit } from '@angular/core';
import { ProyectoService } from '../../../services/proyecto.service';
import { Proyecto } from '../../../interfaces/proyecto';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-list-proyectos',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './list-proyectos.component.html',
  styleUrls: ['./list-proyectos.component.css'],
})
export class ListProyectosComponent implements OnInit {
  proyectos: Proyecto[] = []; // Lista de proyectos
  proyectoSeleccionado: Proyecto = { id: 0, nombre: '' }; // Proyecto seleccionado para editar
  crearProyectoForm: FormGroup; // Formulario para crear proyectos
  tieneAcceso: boolean = true;

  constructor(
    private authService: AuthService,
    private proyectoService: ProyectoService,
    private router: Router,
    private fb: FormBuilder // Inyectar FormBuilder
  ) {
    // Inicializar el formulario para crear proyectos
    this.crearProyectoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  async ngOnInit() {
    const role = await this.authService.getRole(); // Obtener el rol del usuario desde el token
  console.log('User Role:', role); // Verificar el valor del rol en la consola

  if (role !== 'admin') {
    this.tieneAcceso = false; // Si no es admin, no tiene acceso
  } else {
    this.cargarProyectos(); // Si es admin, cargamos los proyectos
  }
  }

  // Cargar todos los proyectos
  cargarProyectos(): void {
    this.proyectoService.getProyectos1().subscribe(
      (proyectos) => {
        this.proyectos = proyectos;
      },
      (error: any) => {
        console.error('Error al cargar los proyectos:', error);
      }
    );
  }

  // Abrir el modal para editar un proyecto
  abrirModalEditar(proyecto: Proyecto): void {
    this.proyectoSeleccionado = { ...proyecto }; // Clonar el proyecto seleccionado
  }

  // Guardar los cambios del proyecto
  guardarCambios(): void {
    if (this.proyectoSeleccionado.id) {
      const proyectoEditado: Proyecto = {
        id: this.proyectoSeleccionado.id,
        nombre: this.proyectoSeleccionado.nombre.trim(), // Asegurarse de que el nombre no tenga espacios innecesarios
      };

      this.proyectoService.editProyecto(proyectoEditado.id, proyectoEditado).subscribe(
        () => {
          alert('Proyecto actualizado con éxito');
          this.cargarProyectos(); // Recargar la lista de proyectos
          const modal = document.getElementById('editarProyectoModal');
          if (modal) {
            (modal as any).classList.remove('show'); // Cerrar el modal
          }
        },
        (error: any) => {
          console.error('Error al actualizar el proyecto:', error);
          alert('Hubo un error al actualizar el proyecto');
        }
      );
    }
  }

  // Crear un nuevo proyecto
  crearProyecto(): void {
    if (this.crearProyectoForm.valid) {
      const nuevoProyecto: Omit<Proyecto, 'id'> = {
        nombre: this.crearProyectoForm.value.nombre.trim(),
      };

      this.proyectoService.addProyecto(nuevoProyecto).subscribe(
        () => {
          alert('Proyecto creado con éxito');
          this.cargarProyectos(); // Recargar la lista de proyectos
          this.crearProyectoForm.reset(); // Reiniciar el formulario
          const modal = document.getElementById('crearProyectoModal');
          if (modal) {
            (modal as any).classList.remove('show'); // Cerrar el modal
          }
        },
        (error: any) => {
          console.error('Error al crear el proyecto:', error);
          alert('Hubo un error al crear el proyecto');
        }
      );
    } else {
      this.crearProyectoForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
    }
  }

  // Eliminar un proyecto
  eliminarProyecto(id: number): void {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este proyecto?');
    if (confirmar) {
      this.proyectoService.deleteProyecto(id).subscribe(
        () => {
          alert('Proyecto eliminado con éxito');
          this.cargarProyectos(); // Recargar la lista de proyectos
        },
        (error: any) => { // Declarar explícitamente el tipo del parámetro error
          console.error('Error al eliminar el proyecto:', error);
          alert('Hubo un error al eliminar el proyecto');
        }
      );
    }
  }

  volverAReservas(): void {
    this.router.navigate(['/reservas']);
  }
}
