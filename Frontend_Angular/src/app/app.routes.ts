import { Routes } from '@angular/router';
import { LoginComponent } from './component/auth/login/login.component';
import { ListReservasComponent } from './component/interfaz-usuario/list-reservas/list-reservas.component';
import { CrearUsuarioComponent } from './component/interfaz-admin/crear-usuario/crear-usuario.component';

export const appRoutes: Routes = [
  // Reservas
  { path: 'reservas', component: ListReservasComponent },


  // Login
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige a la página de login por defecto
  { path: 'login', component: LoginComponent }, // Ruta para el login
  {path: 'createuser', component: CrearUsuarioComponent}, // Ruta para el admin
  { path: '**', redirectTo: '/login' }, // Redirige a login si la ruta no existe
];
