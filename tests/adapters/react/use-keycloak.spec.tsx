import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { KeycloakProvider } from '@/adapters/react/keycloak-provider';
import { useKeycloak } from '@/adapters/react/use-keycloak';
import type { KeycloakAuthConfig } from '@/core/types';

const KeycloakConstructor = vi.mocked(
  (await import('keycloak-js')).default,
);

describe('useKeycloak (React)', () => {
  const config: KeycloakAuthConfig = {
    url: 'http://localhost:8080',
    realm: 'test',
    clientId: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <KeycloakProvider config={config}>{children}</KeycloakProvider>
      );
    };
  }

  it('should_throw_when_used_outside_provider', () => {
    expect(() => {
      renderHook(() => useKeycloak());
    }).toThrow('useKeycloak deve ser usado dentro de <KeycloakProvider>');
  });

  it('should_return_initial_unauthenticated_state', async () => {
    const kcInstance = KeycloakConstructor.mock.results[0]?.value ?? {};
    // Preconfigura o mock antes do render
    KeycloakConstructor.mockImplementation(() => {
      const mock = {
        init: vi.fn().mockResolvedValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        updateToken: vi.fn().mockResolvedValue(false),
        hasRealmRole: vi.fn().mockReturnValue(false),
        hasResourceRole: vi.fn().mockReturnValue(false),
        loadUserProfile: vi.fn().mockResolvedValue({}),
        authenticated: false,
        token: undefined,
        tokenParsed: undefined,
        refreshToken: undefined,
        idToken: undefined,
        realmAccess: { roles: [] },
        resourceAccess: {},
        onAuthSuccess: null,
        onAuthError: null,
        onAuthRefreshSuccess: null,
        onAuthRefreshError: null,
        onTokenExpired: null,
        onAuthLogout: null,
      };
      return mock;
    });

    const { result } = renderHook(() => useKeycloak(), {
      wrapper: createWrapper(),
    });

    // Aguarda inicialização
    await vi.waitFor(() => {
      expect(result.current.initialized).toBe(true);
    });

    expect(result.current.authenticated).toBe(false);
    expect(result.current.token).toBeUndefined();
    expect(result.current.roles).toEqual([]);
  });

  it('should_expose_login_and_logout_functions', async () => {
    KeycloakConstructor.mockImplementation(() => ({
      init: vi.fn().mockResolvedValue(false),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      register: vi.fn(),
      updateToken: vi.fn().mockResolvedValue(false),
      hasRealmRole: vi.fn().mockReturnValue(false),
      hasResourceRole: vi.fn().mockReturnValue(false),
      loadUserProfile: vi.fn().mockResolvedValue({}),
      authenticated: false,
      token: undefined,
      tokenParsed: undefined,
      refreshToken: undefined,
      idToken: undefined,
      realmAccess: { roles: [] },
      resourceAccess: {},
      onAuthSuccess: null,
      onAuthError: null,
      onAuthRefreshSuccess: null,
      onAuthRefreshError: null,
      onTokenExpired: null,
      onAuthLogout: null,
    }));

    const { result } = renderHook(() => useKeycloak(), {
      wrapper: createWrapper(),
    });

    await vi.waitFor(() => {
      expect(result.current.initialized).toBe(true);
    });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.hasRealmRole).toBe('function');
    expect(typeof result.current.hasResourceRole).toBe('function');
    expect(typeof result.current.updateToken).toBe('function');
  });
});
