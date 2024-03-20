import Keycloak from 'keycloak-js';
import { EventEmitter } from './event-emitter';
import { TokenManager } from './token-manager';
import { KeycloakInitError } from './errors';
import type {
  KeycloakAuthConfig,
  KeycloakAuthState,
  KeycloakAuthEvent,
  IKeycloakAuth,
  StateChangeListener,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakRegisterOptions,
} from './types';

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

/** Classe principal — wrapper sobre keycloak-js */
export class KeycloakAuth implements IKeycloakAuth {
  private readonly keycloak: Keycloak;
  private readonly tokenManager: TokenManager;
  private readonly eventEmitter = new EventEmitter<KeycloakAuthEvent>();
  private readonly stateListeners = new Set<StateChangeListener>();
  private _state: KeycloakAuthState = { ...INITIAL_STATE };

  constructor(private readonly config: KeycloakAuthConfig) {
    this.keycloak = new Keycloak({
      url: config.url,
      realm: config.realm,
      clientId: config.clientId,
    });

    this.tokenManager = new TokenManager({
      keycloak: this.keycloak,
      minValidity: config.minTokenValidity ?? 30,
      refreshInterval: config.tokenRefreshInterval ?? 60,
      onRefreshSuccess: () => this.syncState(),
      onRefreshError: () => this.eventEmitter.emit('onAuthRefreshError'),
    });
  }

  get state(): KeycloakAuthState {
    return { ...this._state };
  }

  get keycloakInstance(): Keycloak {
    return this.keycloak;
  }

  /** Inicializa a conexão com o Keycloak */
  async init(): Promise<boolean> {
    this.registerKeycloakCallbacks();

    try {
      const authenticated = await this.keycloak.init(
        this.config.initOptions ?? {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri:
            typeof window !== 'undefined'
              ? `${window.location.origin}/silent-check-sso.html`
              : undefined,
          pkceMethod: 'S256',
        },
      );

      this.syncState();
      this._state.initialized = true;
      this.notifyStateListeners();

      if (authenticated) {
        this.tokenManager.start();
        await this.loadUserProfile();
      }

      this.eventEmitter.emit('onReady');
      return authenticated;
    } catch (error) {
      throw new KeycloakInitError(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async login(options?: KeycloakLoginOptions): Promise<void> {
    await this.keycloak.login(options);
  }

  async logout(options?: KeycloakLogoutOptions): Promise<void> {
    this.tokenManager.stop();
    await this.keycloak.logout(options);
  }

  async register(options?: KeycloakRegisterOptions): Promise<void> {
    await this.keycloak.register(options);
  }

  async updateToken(minValidity = 30): Promise<boolean> {
    const refreshed = await this.keycloak.updateToken(minValidity);
    if (refreshed) this.syncState();
    return refreshed;
  }

  hasRealmRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  hasResourceRole(role: string, resource?: string): boolean {
    return this.keycloak.hasResourceRole(role, resource);
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  /** Registra listener de mudança de estado. Retorna unsubscribe */
  onStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /** Registra listener de evento. Retorna unsubscribe */
  onEvent(event: KeycloakAuthEvent, listener: () => void): () => void {
    return this.eventEmitter.on(event, listener);
  }

  /** Limpa todos os timers e listeners */
  destroy(): void {
    this.tokenManager.stop();
    this.eventEmitter.removeAll();
    this.stateListeners.clear();
  }

  /** Registra os callbacks nativos do keycloak-js */
  private registerKeycloakCallbacks(): void {
    this.keycloak.onAuthSuccess = () => {
      this.syncState();
      this.tokenManager.start();
      this.eventEmitter.emit('onAuthSuccess');
    };

    this.keycloak.onAuthError = () => {
      this.syncState();
      this.eventEmitter.emit('onAuthError');
    };

    this.keycloak.onAuthRefreshSuccess = () => {
      this.syncState();
      this.eventEmitter.emit('onAuthRefreshSuccess');
    };

    this.keycloak.onAuthRefreshError = () => {
      this.syncState();
      this.eventEmitter.emit('onAuthRefreshError');
    };

    this.keycloak.onTokenExpired = () => {
      this.eventEmitter.emit('onTokenExpired');
      this.tokenManager.refresh();
    };

    this.keycloak.onAuthLogout = () => {
      this.tokenManager.stop();
      this.syncState();
      this.eventEmitter.emit('onAuthLogout');
    };
  }

  /** Sincroniza o estado interno com o keycloak-js */
  private syncState(): void {
    this._state = {
      ...this._state,
      authenticated: this.keycloak.authenticated ?? false,
      token: this.keycloak.token,
      refreshToken: this.keycloak.refreshToken,
      idToken: this.keycloak.idToken,
      tokenParsed: this.keycloak.tokenParsed,
      roles: this.keycloak.realmAccess?.roles ?? [],
      resourceRoles: this.extractResourceRoles(),
    };
    this.notifyStateListeners();
  }

  private extractResourceRoles(): Record<string, string[]> {
    const access = this.keycloak.resourceAccess;
    if (!access) return {};

    return Object.entries(access).reduce(
      (acc, [resource, { roles }]) => {
        acc[resource] = roles;
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this._state = { ...this._state, userProfile: profile };
      this.notifyStateListeners();
    } catch {
      // Perfil não disponível — não bloqueia a inicialização
    }
  }

  private notifyStateListeners(): void {
    const snapshot = this.state;
    this.stateListeners.forEach((listener) => listener(snapshot));
  }
}
