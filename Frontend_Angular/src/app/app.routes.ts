import { Routes } from '@angular/router';
import { LoginComponent } from './component/auth/login/login.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige a la página de login por defecto
  { path: 'login', component: LoginComponent }, // Ruta para el login
  { path: '**', redirectTo: '/login' }, // Redirige a login si la ruta no existe
];
