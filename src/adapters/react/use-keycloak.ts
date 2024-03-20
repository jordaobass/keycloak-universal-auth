import { useContext } from 'react';
import { KeycloakContext } from './keycloak-context';
import type { KeycloakLoginOptions, KeycloakLogoutOptions } from '../../core/types';

/**
 * Hook para acessar o estado e ações do Keycloak.
 *
 * Uso:
 * const { authenticated, user, login, logout } = useKeycloak();
 */
export function useKeycloak() {
  const context = useContext(KeycloakContext);

  if (!context) {
    throw new Error(
      '[keycloak-universal-auth] useKeycloak deve ser usado dentro de <KeycloakProvider>',
    );
  }

  return {
    initialized: context.initialized,
    authenticated: context.authenticated,
    token: context.token,
    refreshToken: context.refreshToken,
    tokenParsed: context.tokenParsed,
    userProfile: context.userProfile,
    roles: context.roles,
    resourceRoles: context.resourceRoles,

    login: (options?: KeycloakLoginOptions) =>
      context.auth?.login(options) ?? Promise.resolve(),

    logout: (options?: KeycloakLogoutOptions) =>
      context.auth?.logout(options) ?? Promise.resolve(),

    hasRealmRole: (role: string) =>
      context.auth?.hasRealmRole(role) ?? false,

    hasResourceRole: (role: string, resource?: string) =>
      context.auth?.hasResourceRole(role, resource) ?? false,

    updateToken: (minValidity?: number) =>
      context.auth?.updateToken(minValidity) ?? Promise.resolve(false),

    /** Acesso direto à instância do core (uso avançado) */
    keycloakAuth: context.auth,
  };
}
