import { Routes } from '@angular/router';
import { ListReservasComponent } from './component/reservas/list-reservas/list-reservas.component';

export const routes: Routes = [
  { path: 'reservas', component: ListReservasComponent },
  { path: '**', redirectTo: 'reservas' } // Redirige cualquier ruta no encontrada a /reservas
];
