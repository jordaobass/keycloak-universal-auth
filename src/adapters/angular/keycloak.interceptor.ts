import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { KeycloakService } from './keycloak.service';

/**
 * Interceptor funcional que adiciona o Bearer token em requisições HTTP.
 *
 * Uso em app.config.ts:
 * provideHttpClient(withInterceptors([keycloakInterceptor]))
 */
export const keycloakInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);

  if (!keycloak.state.authenticated) {
    return next(req);
  }

  return from(keycloak.updateToken(5)).pipe(
    switchMap(() => {
      const token = keycloak.getToken();

      if (!token) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });

      return next(authReq);
    }),
  );
};
