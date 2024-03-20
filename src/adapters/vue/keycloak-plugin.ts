import { reactive, type Plugin } from 'vue';
import { KeycloakAuth } from '../../core/keycloak-auth';
import type { KeycloakAuthConfig, KeycloakAuthState } from '../../core/types';
import { KEYCLOAK_KEY } from './keycloak-symbols';

const INITIAL_STATE: KeycloakAuthState = {
  initialized: false,
  authenticated: false,
  token: undefined,
  refreshToken: undefined,
  idToken: undefined,
  tokenParsed: undefined,
  userProfile: undefined,
  roles: [],
  resourceRoles: {},
};

/**
 * Plugin Vue que inicializa o Keycloak e disponibiliza via inject.
 *
 * Uso:
 * app.use(keycloakPlugin, { url, realm, clientId });
 */
export const keycloakPlugin: Plugin = {
  install(app, config: KeycloakAuthConfig) {
    const auth = new KeycloakAuth(config);
    const state = reactive<KeycloakAuthState>({ ...INITIAL_STATE });

    auth.onStateChange((newState) => {
      Object.assign(state, newState);
    });

    app.provide(KEYCLOAK_KEY, { state, auth });

    auth.init().catch((error) => {
      console.error('[keycloak-universal-auth] Falha ao inicializar:', error);
    });
  },
};
