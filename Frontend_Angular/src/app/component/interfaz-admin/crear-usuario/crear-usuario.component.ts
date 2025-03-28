import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-usuario',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent {

  private fb: FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  emailExistsError: string | null = null;
  usernameExistsError: string | null = null;

  newuser: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@apeiroo\.com$/)]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    confirmpassword: ['', [Validators.required]],
    roles: ['', [Validators.required]]
  });

  isInvalid(controlName: string) {
    return this.newuser?.controls[controlName].invalid && this.newuser?.controls[controlName].touched;
  }

  equalsPasswords() {
    return this.newuser?.value.password === this.newuser?.value.confirmpassword;
  }

  async submitedForm() {
    if (!this.newuser.invalid) {
      const user = {
        email: this.newuser.value.email,
        username: this.newuser.value.username,
        password: this.newuser.value.password,
        roles: this.newuser.value.roles
      };

      try {
        await this.auth.registerUser(user);
        Swal.fire("Usuario creado con éxito");
        this.newuser.reset();
        this.router.navigate(['/reservas']);
      } catch (error: any) {
        if (error?.message === 'El correo ya está registrado') {
          this.emailExistsError = 'El correo ya está registrado';
        }
        if (error?.message === 'El nombre de usuario ya está registrado') {
          this.usernameExistsError = 'El nombre de usuario ya está registrado';
        }
      }
    } else {
      this.newuser.markAllAsTouched();
    }
  }

}
