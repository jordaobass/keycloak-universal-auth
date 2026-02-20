import { describe, it, expect, vi } from 'vitest';
import { useKeycloak } from '@/adapters/vue/use-keycloak';
import { KEYCLOAK_KEY } from '@/adapters/vue/keycloak-symbols';
import { reactive, computed } from 'vue';
import {
  createKeycloakMock,
  simulateAuthenticated,
  asKeycloak,
} from '../../mocks/keycloak-mock';

// Precisamos mockar o inject do Vue
vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue');
  return {
    ...actual,
    inject: vi.fn(),
  };
});

import { inject } from 'vue';
const mockedInject = vi.mocked(inject);

describe('useKeycloak (Vue)', () => {
  it('should_throw_when_plugin_not_installed', () => {
    mockedInject.mockReturnValue(undefined);

    expect(() => useKeycloak()).toThrow(
      'useKeycloak requer keycloakPlugin instalado',
    );
  });

  it('should_return_reactive_authenticated_state', () => {
    const kcMock = createKeycloakMock();
    simulateAuthenticated(kcMock);

    const state = reactive({
      initialized: true,
      authenticated: true,
      token: 'fake-token',
      refreshToken: 'fake-refresh',
      idToken: 'fake-id',
      tokenParsed: { sub: 'user-123' },
      userProfile: { firstName: 'João' },
      roles: ['user', 'admin'],
      resourceRoles: { app: ['editor'] },
    });

    // Mock do KeycloakAuth com os métodos necessários
    const authMock = {
      login: vi.fn(),
      logout: vi.fn(),
      hasRealmRole: vi.fn().mockReturnValue(true),
      hasResourceRole: vi.fn().mockReturnValue(false),
      updateToken: vi.fn().mockResolvedValue(true),
    };

    mockedInject.mockReturnValue({ state, auth: authMock });

    const result = useKeycloak();

    expect(result.authenticated.value).toBe(true);
    expect(result.token.value).toBe('fake-token');
    expect(result.roles.value).toEqual(['user', 'admin']);
    expect(result.hasRealmRole('admin')).toBe(true);
  });

  it('should_expose_login_and_logout_functions', () => {
    const authMock = {
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      hasRealmRole: vi.fn(),
      hasResourceRole: vi.fn(),
      updateToken: vi.fn(),
    };

    const state = reactive({
      initialized: true,
      authenticated: false,
      token: undefined,
      refreshToken: undefined,
      idToken: undefined,
      tokenParsed: undefined,
      userProfile: undefined,
      roles: [],
      resourceRoles: {},
    });

    mockedInject.mockReturnValue({ state, auth: authMock });

    const result = useKeycloak();

    result.login({ redirectUri: 'http://localhost' });
    expect(authMock.login).toHaveBeenCalledWith({
      redirectUri: 'http://localhost',
    });

    result.logout();
    expect(authMock.logout).toHaveBeenCalledOnce();
  });
});
