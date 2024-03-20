/**
 * Exemplo Angular — keycloak-universal-auth
 *
 * Instalação:
 *   npm install keycloak-universal-auth keycloak-js
 *
 * Este arquivo configura o Keycloak como provider na aplicação standalone.
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideKeycloak, keycloakInterceptor } from 'keycloak-universal-auth/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([keycloakInterceptor])),
    provideKeycloak({
      url: 'http://localhost:8080',
      realm: 'meu-realm',
      clientId: 'meu-app',
    }),
  ],
};
