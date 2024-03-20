import {
  makeEnvironmentProviders,
  type EnvironmentProviders,
  APP_INITIALIZER,
} from '@angular/core';
import type { KeycloakAuthConfig } from '../../core/types';
import { KEYCLOAK_CONFIG } from './keycloak.tokens';
import { KeycloakService } from './keycloak.service';

/**
 * Configura os providers necessários para o Keycloak em aplicações standalone.
 *
 * Uso em app.config.ts:
 * export const appConfig = {
 *   providers: [provideKeycloak({ url, realm, clientId })]
 * };
 */
export function provideKeycloak(
  config: KeycloakAuthConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: KEYCLOAK_CONFIG, useValue: config },
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: (keycloak: KeycloakService) => () => keycloak.init(),
      deps: [KeycloakService],
      multi: true,
    },
  ]);
}
