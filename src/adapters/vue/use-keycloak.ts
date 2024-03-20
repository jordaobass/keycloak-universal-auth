import { computed, inject } from 'vue';
import { KEYCLOAK_KEY } from './keycloak-symbols';
import type { KeycloakLoginOptions, KeycloakLogoutOptions } from '../../core/types';

/**
 * Composable para acessar o estado e ações do Keycloak.
 *
 * Uso:
 * const { authenticated, userProfile, login, logout } = useKeycloak();
 */
export function useKeycloak() {
  const context = inject(KEYCLOAK_KEY);

  if (!context) {
    throw new Error(
      '[keycloak-universal-auth] useKeycloak requer keycloakPlugin instalado via app.use()',
    );
  }

  const { state, auth } = context;

  return {
    initialized: computed(() => state.initialized),
    authenticated: computed(() => state.authenticated),
    token: computed(() => state.token),
    roles: computed(() => state.roles),
    resourceRoles: computed(() => state.resourceRoles),
    userProfile: computed(() => state.userProfile),
    tokenParsed: computed(() => state.tokenParsed),

    login: (options?: KeycloakLoginOptions) => auth.login(options),
    logout: (options?: KeycloakLogoutOptions) => auth.logout(options),

    hasRealmRole: (role: string) => auth.hasRealmRole(role),
    hasResourceRole: (role: string, resource?: string) =>
      auth.hasResourceRole(role, resource),

    updateToken: (minValidity?: number) => auth.updateToken(minValidity),

    /** Acesso direto à instância do core (uso avançado) */
    keycloakAuth: auth,
  };
}
