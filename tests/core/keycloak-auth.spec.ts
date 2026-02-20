import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeycloakAuth } from '@/core/keycloak-auth';
import type { KeycloakAuthConfig, KeycloakAuthState } from '@/core/types';
import { KeycloakInitError } from '@/core/errors';

// O mock do keycloak-js vem do setup.ts
// Precisamos acessar a instância criada internamente
const KeycloakConstructor = vi.mocked(
  (await import('keycloak-js')).default,
);

describe('KeycloakAuth', () => {
  const config: KeycloakAuthConfig = {
    url: 'http://localhost:8080',
    realm: 'test-realm',
    clientId: 'test-client',
  };

  let auth: KeycloakAuth;
  let kcInstance: ReturnType<typeof KeycloakConstructor>;

  beforeEach(() => {
    vi.clearAllMocks();
    auth = new KeycloakAuth(config);
    // Pega a instância que foi criada no construtor
    kcInstance = KeycloakConstructor.mock.results[0]?.value;
  });

  describe('constructor', () => {
    it('should_create_keycloak_instance_with_correct_config', () => {
      expect(KeycloakConstructor).toHaveBeenCalledWith({
        url: 'http://localhost:8080',
        realm: 'test-realm',
        clientId: 'test-client',
      });
    });

    it('should_have_initial_state_not_initialized', () => {
      expect(auth.state.initialized).toBe(false);
      expect(auth.state.authenticated).toBe(false);
      expect(auth.state.token).toBeUndefined();
      expect(auth.state.roles).toEqual([]);
    });
  });

  describe('init', () => {
    it('should_initialize_keycloak_and_return_authenticated_status', async () => {
      kcInstance.init.mockResolvedValue(true);
      kcInstance.authenticated = true;
      kcInstance.token = 'fake-token';
      kcInstance.realmAccess = { roles: ['user'] };
      kcInstance.resourceAccess = {};

      const result = await auth.init();

      expect(result).toBe(true);
      expect(kcInstance.init).toHaveBeenCalledOnce();
      expect(auth.state.initialized).toBe(true);
      expect(auth.state.authenticated).toBe(true);
    });

    it('should_use_default_init_options_when_none_provided', async () => {
      kcInstance.init.mockResolvedValue(false);

      await auth.init();

      expect(kcInstance.init).toHaveBeenCalledWith(
        expect.objectContaining({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
        }),
      );
    });

    it('should_use_custom_init_options_when_provided', async () => {
      const customAuth = new KeycloakAuth({
        ...config,
        initOptions: { onLoad: 'login-required' },
      });
      const customKc = KeycloakConstructor.mock.results.at(-1)?.value;
      customKc.init.mockResolvedValue(true);
      customKc.authenticated = true;
      customKc.realmAccess = { roles: [] };
      customKc.resourceAccess = {};

      await customAuth.init();

      expect(customKc.init).toHaveBeenCalledWith({ onLoad: 'login-required' });
    });

    it('should_throw_KeycloakInitError_when_init_fails', async () => {
      kcInstance.init.mockRejectedValue(new Error('network error'));

      await expect(auth.init()).rejects.toThrow(KeycloakInitError);
    });

    it('should_load_user_profile_when_authenticated', async () => {
      kcInstance.init.mockResolvedValue(true);
      kcInstance.authenticated = true;
      kcInstance.realmAccess = { roles: [] };
      kcInstance.resourceAccess = {};

      await auth.init();

      expect(kcInstance.loadUserProfile).toHaveBeenCalledOnce();
      expect(auth.state.userProfile).toEqual(
        expect.objectContaining({ firstName: 'João' }),
      );
    });

    it('should_not_load_profile_when_not_authenticated', async () => {
      kcInstance.init.mockResolvedValue(false);

      await auth.init();

      expect(kcInstance.loadUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should_delegate_to_keycloak_login', async () => {
      await auth.login({ redirectUri: 'http://localhost' });

      expect(kcInstance.login).toHaveBeenCalledWith({
        redirectUri: 'http://localhost',
      });
    });
  });

  describe('logout', () => {
    it('should_delegate_to_keycloak_logout', async () => {
      await auth.logout({ redirectUri: 'http://localhost' });

      expect(kcInstance.logout).toHaveBeenCalledWith({
        redirectUri: 'http://localhost',
      });
    });
  });

  describe('register', () => {
    it('should_delegate_to_keycloak_register', async () => {
      await auth.register();

      expect(kcInstance.register).toHaveBeenCalledOnce();
    });
  });

  describe('updateToken', () => {
    it('should_call_updateToken_with_min_validity', async () => {
      kcInstance.updateToken.mockResolvedValue(false);

      await auth.updateToken(60);

      expect(kcInstance.updateToken).toHaveBeenCalledWith(60);
    });

    it('should_use_default_min_validity_of_30', async () => {
      kcInstance.updateToken.mockResolvedValue(false);

      await auth.updateToken();

      expect(kcInstance.updateToken).toHaveBeenCalledWith(30);
    });
  });

  describe('hasRealmRole', () => {
    it('should_delegate_to_keycloak_hasRealmRole', () => {
      kcInstance.hasRealmRole.mockReturnValue(true);

      expect(auth.hasRealmRole('admin')).toBe(true);
      expect(kcInstance.hasRealmRole).toHaveBeenCalledWith('admin');
    });
  });

  describe('hasResourceRole', () => {
    it('should_delegate_to_keycloak_hasResourceRole', () => {
      kcInstance.hasResourceRole.mockReturnValue(true);

      expect(auth.hasResourceRole('editor', 'meu-app')).toBe(true);
      expect(kcInstance.hasResourceRole).toHaveBeenCalledWith('editor', 'meu-app');
    });
  });

  describe('getToken', () => {
    it('should_return_current_token', () => {
      kcInstance.token = 'my-token';

      expect(auth.getToken()).toBe('my-token');
    });

    it('should_return_undefined_when_no_token', () => {
      kcInstance.token = undefined;

      expect(auth.getToken()).toBeUndefined();
    });
  });

  describe('onStateChange', () => {
    it('should_notify_listeners_when_state_changes', async () => {
      const listener = vi.fn();
      auth.onStateChange(listener);

      kcInstance.init.mockResolvedValue(false);
      await auth.init();

      expect(listener).toHaveBeenCalled();
      const lastCall = listener.mock.calls.at(-1)?.[0] as KeycloakAuthState;
      expect(lastCall.initialized).toBe(true);
    });

    it('should_return_unsubscribe_function', async () => {
      const listener = vi.fn();
      const unsubscribe = auth.onStateChange(listener);

      unsubscribe();

      kcInstance.init.mockResolvedValue(false);
      await auth.init();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should_provide_immutable_state_snapshot', async () => {
      const states: KeycloakAuthState[] = [];
      auth.onStateChange((state) => states.push(state));

      kcInstance.init.mockResolvedValue(false);
      await auth.init();

      // Cada chamada deve ter um objeto diferente
      const uniqueRefs = new Set(states);
      expect(uniqueRefs.size).toBe(states.length);
    });
  });

  describe('onEvent', () => {
    it('should_register_keycloak_callbacks_on_init', async () => {
      kcInstance.init.mockResolvedValue(false);
      await auth.init();

      expect(kcInstance.onAuthSuccess).toBeDefined();
      expect(kcInstance.onAuthError).toBeDefined();
      expect(kcInstance.onTokenExpired).toBeDefined();
      expect(kcInstance.onAuthLogout).toBeDefined();
    });

    it('should_emit_onReady_after_init', async () => {
      const listener = vi.fn();
      auth.onEvent('onReady', listener);

      kcInstance.init.mockResolvedValue(false);
      await auth.init();

      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe('destroy', () => {
    it('should_clear_all_listeners', async () => {
      const stateListener = vi.fn();
      const eventListener = vi.fn();

      auth.onStateChange(stateListener);
      auth.onEvent('onReady', eventListener);

      auth.destroy();

      // Após destroy, init não deve notificar ninguém
      kcInstance.init.mockResolvedValue(false);
      await auth.init();

      expect(stateListener).not.toHaveBeenCalled();
      // onReady não deve ser chamado pois os listeners de evento foram limpos
      expect(eventListener).not.toHaveBeenCalled();
    });
  });

  describe('state sync', () => {
    it('should_sync_roles_from_keycloak_realmAccess', async () => {
      kcInstance.init.mockResolvedValue(true);
      kcInstance.authenticated = true;
      kcInstance.realmAccess = { roles: ['user', 'admin'] };
      kcInstance.resourceAccess = {};

      await auth.init();

      expect(auth.state.roles).toEqual(['user', 'admin']);
    });

    it('should_sync_resource_roles_from_keycloak', async () => {
      kcInstance.init.mockResolvedValue(true);
      kcInstance.authenticated = true;
      kcInstance.realmAccess = { roles: [] };
      kcInstance.resourceAccess = {
        'app-a': { roles: ['editor'] },
        'app-b': { roles: ['viewer', 'commenter'] },
      };

      await auth.init();

      expect(auth.state.resourceRoles).toEqual({
        'app-a': ['editor'],
        'app-b': ['viewer', 'commenter'],
      });
    });

    it('should_handle_missing_realmAccess_gracefully', async () => {
      kcInstance.init.mockResolvedValue(true);
      kcInstance.authenticated = true;
      kcInstance.realmAccess = undefined as any;
      kcInstance.resourceAccess = {};

      await auth.init();

      expect(auth.state.roles).toEqual([]);
    });
  });
});
