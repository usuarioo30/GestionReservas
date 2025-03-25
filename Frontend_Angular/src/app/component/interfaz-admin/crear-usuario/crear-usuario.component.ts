import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../interfaces/usuario';

@Component({
  selector: 'app-crear-usuario',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent {

  private fb: FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService);

  newuser: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
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
      
      const user: Omit<Usuario, "id"> = {
        email: this.newuser.value.email,
        username: this.newuser.value.username,
        password: this.newuser.value.password,
        roles: "user"
      }

      await this.auth.registerUser(user);

      alert("Usuario creado con éxito");

    } else {
      this.newuser.markAllAsTouched();
    }

  }

}
