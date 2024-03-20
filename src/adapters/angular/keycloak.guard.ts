import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { KeycloakService } from './keycloak.service';

interface KeycloakGuardOptions {
  /** Roles necessárias para acessar a rota */
  roles?: string[];
  /** URL de redirecionamento caso não autenticado */
  redirectTo?: string;
}

/**
 * Guard funcional para proteger rotas com autenticação Keycloak.
 *
 * Uso:
 * { path: 'admin', canActivate: [keycloakGuard({ roles: ['admin'] })] }
 */
export function keycloakGuard(options?: KeycloakGuardOptions): CanActivateFn {
  return () => {
    const keycloak = inject(KeycloakService);
    const router = inject(Router);

    if (!keycloak.state.authenticated) {
      if (options?.redirectTo) {
        return router.parseUrl(options.redirectTo);
      }
      keycloak.login();
      return false;
    }

    if (options?.roles?.length) {
      const hasAllRoles = options.roles.every((role) =>
        keycloak.hasRealmRole(role),
      );

      if (!hasAllRoles) {
        if (options.redirectTo) {
          return router.parseUrl(options.redirectTo);
        }
        return false;
      }
    }

    return true;
  };
}
