import { vi } from 'vitest';
import type Keycloak from 'keycloak-js';

export interface KeycloakMock {
  init: ReturnType<typeof vi.fn>;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  updateToken: ReturnType<typeof vi.fn>;
  hasRealmRole: ReturnType<typeof vi.fn>;
  hasResourceRole: ReturnType<typeof vi.fn>;
  loadUserProfile: ReturnType<typeof vi.fn>;
  authenticated: boolean;
  token: string | undefined;
  tokenParsed: Record<string, unknown> | undefined;
  refreshToken: string | undefined;
  idToken: string | undefined;
  subject: string | undefined;
  realmAccess: { roles: string[] };
  resourceAccess: Record<string, { roles: string[] }>;
  onAuthSuccess: (() => void) | null;
  onAuthError: (() => void) | null;
  onAuthRefreshSuccess: (() => void) | null;
  onAuthRefreshError: (() => void) | null;
  onTokenExpired: (() => void) | null;
  onAuthLogout: (() => void) | null;
}

/** Cria um mock do keycloak-js com valores padrão */
export function createKeycloakMock(
  overrides?: Partial<KeycloakMock>,
): KeycloakMock {
  return {
    init: vi.fn().mockResolvedValue(true),
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    updateToken: vi.fn().mockResolvedValue(false),
    hasRealmRole: vi.fn().mockReturnValue(false),
    hasResourceRole: vi.fn().mockReturnValue(false),
    loadUserProfile: vi.fn().mockResolvedValue({
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@exemplo.com',
      username: 'joaosilva',
    }),
    authenticated: false,
    token: undefined,
    tokenParsed: undefined,
    refreshToken: undefined,
    idToken: undefined,
    subject: undefined,
    realmAccess: { roles: [] },
    resourceAccess: {},
    onAuthSuccess: null,
    onAuthError: null,
    onAuthRefreshSuccess: null,
    onAuthRefreshError: null,
    onTokenExpired: null,
    onAuthLogout: null,
    ...overrides,
  };
}

/** Simula autenticação bem sucedida no mock */
export function simulateAuthenticated(mock: KeycloakMock): void {
  mock.authenticated = true;
  mock.token = 'fake-access-token';
  mock.refreshToken = 'fake-refresh-token';
  mock.idToken = 'fake-id-token';
  mock.tokenParsed = { sub: 'user-123', preferred_username: 'joaosilva' };
  mock.subject = 'user-123';
  mock.realmAccess = { roles: ['user', 'admin'] };
  mock.resourceAccess = {
    'meu-app': { roles: ['editor'] },
  };
}

/** Converte mock para tipo Keycloak (para injeção) */
export function asKeycloak(mock: KeycloakMock): Keycloak {
  return mock as unknown as Keycloak;
}
