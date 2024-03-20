import { Routes } from '@angular/router';
import { keycloakGuard } from 'keycloak-universal-auth/angular';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin.component').then((m) => m.AdminComponent),
    canActivate: [keycloakGuard({ roles: ['admin'], redirectTo: '/' })],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil.component').then((m) => m.PerfilComponent),
    canActivate: [keycloakGuard()],
  },
];
