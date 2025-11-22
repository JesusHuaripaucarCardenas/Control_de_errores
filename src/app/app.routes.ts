import { Routes } from '@angular/router';
import { Contactos } from './feature/contactos/contactos';
import { Admin } from './feature/admin/admin';
import { CrearRegistros } from './feature/crear-registros/crear-registros';
import { Registro } from './feature/registro/registro';

export const routes: Routes = [
  {
    path: 'contactos',
    component: Contactos
  },
  {
    path: 'admin',
    component: Admin
  },
  {
    path: 'crear-registros',
    component: CrearRegistros
  },
    {
    path: 'registro',
    component: Registro
  },

  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  }
];
