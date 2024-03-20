import { InjectionToken } from '@angular/core';
import type { KeycloakAuthConfig } from '../../core/types';

export const KEYCLOAK_CONFIG = new InjectionToken<KeycloakAuthConfig>(
  'KEYCLOAK_AUTH_CONFIG',
);
