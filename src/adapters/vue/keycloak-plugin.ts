import { reactive, type App, type Plugin } from 'vue';
import { KeycloakAuth } from '../../core/keycloak-auth';
import { INITIAL_STATE } from '../../core/constants';
import type { KeycloakAuthConfig, KeycloakAuthState } from '../../core/types';
import { KEYCLOAK_KEY } from './keycloak-symbols';

/**
 * Plugin Vue que inicializa o Keycloak e disponibiliza via inject.
 *
 * Uso:
 * app.use(keycloakPlugin, { url, realm, clientId });
 */
export const keycloakPlugin: Plugin = {
  install(app: App, config: KeycloakAuthConfig) {
    const auth = new KeycloakAuth(config);
    const state = reactive<KeycloakAuthState>({ ...INITIAL_STATE });

    const unsubscribe = auth.onStateChange((newState) => {
      Object.assign(state, newState);
    });

    app.provide(KEYCLOAK_KEY, { state, auth });

    // Cleanup ao desmontar a aplicação
    app.config.globalProperties.$keycloakCleanup = () => {
      unsubscribe();
      auth.destroy();
    };

    const originalUnmount = app.unmount.bind(app);
    app.unmount = () => {
      unsubscribe();
      auth.destroy();
      originalUnmount();
    };

    auth.init().catch((error) => {
      console.error('[keycloak-universal-auth] Falha ao inicializar:', error);
    });
  },
};
