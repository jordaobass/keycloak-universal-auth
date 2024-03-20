import { createContext } from 'react';
import type { KeycloakAuthState } from '../../core/types';
import type { KeycloakAuth } from '../../core/keycloak-auth';

export interface KeycloakContextValue extends KeycloakAuthState {
  auth: KeycloakAuth | null;
}

export const KeycloakContext = createContext<KeycloakContextValue | null>(null);
