import type { InjectionKey } from 'vue';
import type { KeycloakAuth } from '../../core/keycloak-auth';
import type { KeycloakAuthState } from '../../core/types';

export interface KeycloakInjection {
  state: KeycloakAuthState;
  auth: KeycloakAuth;
}

export const KEYCLOAK_KEY: InjectionKey<KeycloakInjection> = Symbol('keycloak-auth');
