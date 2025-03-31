import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../interfaces/usuario';
import { NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-editprofile',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './editprofile.component.html',
  styleUrl: './editprofile.component.css'
})
export class EditprofileComponent implements OnInit{

  token!: string | null;
  user!: Usuario
  private fb: FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService);
  validUsername!: any;
  editUser: FormGroup = this.fb.group({
    id: ['', []],
    email: ['', []],
    username: ['', [Validators.required]],
    password: ['', []],
    confirmPassword: ['', []]
  }, { validators: this.passwordsMatchValidator });

  async ngOnInit(): Promise<void> {
      this.token = localStorage.getItem("access_token");
      if (this.token) {
        const decodedToken = this.auth.decodeToken(this.token);
        console.log(decodedToken);

        this.user = await this.auth.getUserByMail(decodedToken.email);
        this.editUser.setValue({
          id: this.user.id,
          email: this.user.email,
          username: this.user.username,
          password: '',
          confirmPassword: ''
        })

      }

  }

  inValidField(field: string): boolean {
    return this.editUser.controls[field]?.invalid && this.editUser.controls[field]?.touched;
  }

  private passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword
      ? { passNoCoinciden: true }
      : null;
  }

  async checkTakenUser(username: string) {
    this.validUsername = await this.auth.getUserByUsername(username);
    return this.validUsername.username? true : false;
  }

  async editUserSubmit() {
    if (this.editUser.valid && !(await this.checkTakenUser(this.editUser.get('username')?.value))) {
      
      const { id, username, password } = this.editUser.value;
      
      try {
        
        if (password) {
          await this.auth.editUser(id, username, password);
          await Swal.fire({
                title: "Resultado",
                text: "Usuario editado con éxito",
                icon: "success",
                confirmButtonColor: "green",
                confirmButtonText: "Hecho",
              });
        } else {
          await this.auth.editUser(id, username);
          await Swal.fire({
            title: "Resultado",
            text: "Usuario editado con éxito",
            icon: "success",
            confirmButtonColor: "green",
            confirmButtonText: "Hecho",
          });
        }
      } catch (error) {
        
      }


    } else {
      this.validUsername = false;
      this.editUser.markAllAsTouched();
    }
  }
}


