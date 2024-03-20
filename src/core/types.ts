import type Keycloak from 'keycloak-js';
import type {
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakRegisterOptions,
  KeycloakTokenParsed,
  KeycloakProfile,
} from 'keycloak-js';

/** Configuração para inicializar a conexão com o Keycloak */
export interface KeycloakAuthConfig {
  url: string;
  realm: string;
  clientId: string;
  initOptions?: KeycloakInitOptions;
  /** Intervalo em segundos para refresh proativo do token (padrão: 60) */
  tokenRefreshInterval?: number;
  /** Validade mínima em segundos para considerar refresh necessário (padrão: 30) */
  minTokenValidity?: number;
}

/** Estado reativo da autenticação */
export interface KeycloakAuthState {
  initialized: boolean;
  authenticated: boolean;
  token: string | undefined;
  refreshToken: string | undefined;
  idToken: string | undefined;
  tokenParsed: KeycloakTokenParsed | undefined;
  userProfile: KeycloakProfile | undefined;
  roles: string[];
  resourceRoles: Record<string, string[]>;
}

/** Eventos emitidos pelo core */
export type KeycloakAuthEvent =
  | 'onReady'
  | 'onAuthSuccess'
  | 'onAuthError'
  | 'onAuthRefreshSuccess'
  | 'onAuthRefreshError'
  | 'onTokenExpired'
  | 'onAuthLogout';

/** Listener para mudanças de estado */
export type StateChangeListener = (state: KeycloakAuthState) => void;

/** Contrato público do core de autenticação */
export interface IKeycloakAuth {
  readonly state: KeycloakAuthState;
  readonly keycloakInstance: Keycloak;

  init(): Promise<boolean>;
  login(options?: KeycloakLoginOptions): Promise<void>;
  logout(options?: KeycloakLogoutOptions): Promise<void>;
  register(options?: KeycloakRegisterOptions): Promise<void>;
  updateToken(minValidity?: number): Promise<boolean>;
  hasRealmRole(role: string): boolean;
  hasResourceRole(role: string, resource?: string): boolean;
  getToken(): string | undefined;
  onStateChange(listener: StateChangeListener): () => void;
  onEvent(event: KeycloakAuthEvent, listener: () => void): () => void;
  destroy(): void;
}

export type {
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakRegisterOptions,
  KeycloakTokenParsed,
  KeycloakProfile,
};
