import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Proyecto } from '../../../interfaces/proyecto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-proyecto',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-proyecto.component.html',
  styleUrl: './crear-proyecto.component.css'
})
export class CrearProyectoComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  newproject: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
  });

  isInvalid(controlName: string) {
    return this.newproject?.controls[controlName].invalid && this.newproject?.controls[controlName].touched;
  }

  async submitedForm() {

    if (!this.newproject.invalid) {

      const project: Omit<Proyecto, "id"> = {
        nombre: this.newproject.value.nombre,
      }

      await this.auth.registerProject(project);

      Swal.fire("Proyecto creado con éxito");
      this.newproject.reset();
      this.router.navigate(['/reservas']);
    } else {
      this.newproject.markAllAsTouched();

    }

  }
}
