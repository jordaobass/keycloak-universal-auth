import { Injectable, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';
import { KeycloakAuth } from '../../core/keycloak-auth';
import type {
  KeycloakAuthConfig,
  KeycloakAuthState,
  KeycloakAuthEvent,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
} from '../../core/types';
import { KEYCLOAK_CONFIG } from './keycloak.tokens';

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

/** Service Angular que encapsula o core de autenticação Keycloak */
@Injectable({ providedIn: 'root' })
export class KeycloakService implements OnDestroy {
  private readonly auth: KeycloakAuth;
  private readonly stateSubject = new BehaviorSubject<KeycloakAuthState>(INITIAL_STATE);
  private unsubscribe: (() => void) | null = null;

  /** Estado completo como Observable */
  readonly state$: Observable<KeycloakAuthState> = this.stateSubject.asObservable();

  /** Indica se o usuário está autenticado */
  readonly authenticated$ = this.state$.pipe(
    map((s) => s.authenticated),
    distinctUntilChanged(),
  );

  /** Token de acesso atual */
  readonly token$ = this.state$.pipe(
    map((s) => s.token),
    distinctUntilChanged(),
  );

  /** Roles do realm */
  readonly roles$ = this.state$.pipe(
    map((s) => s.roles),
    distinctUntilChanged(),
  );

  /** Perfil do usuário */
  readonly userProfile$ = this.state$.pipe(
    map((s) => s.userProfile),
    distinctUntilChanged(),
  );

  constructor(@Inject(KEYCLOAK_CONFIG) config: KeycloakAuthConfig) {
    this.auth = new KeycloakAuth(config);
    this.unsubscribe = this.auth.onStateChange((state) => {
      this.stateSubject.next(state);
    });
  }

  /** Inicializa a conexão com o Keycloak */
  async init(): Promise<boolean> {
    return this.auth.init();
  }

  async login(options?: KeycloakLoginOptions): Promise<void> {
    return this.auth.login(options);
  }

  async logout(options?: KeycloakLogoutOptions): Promise<void> {
    return this.auth.logout(options);
  }

  /** Verifica se o usuário possui uma role de realm */
  hasRealmRole(role: string): boolean {
    return this.auth.hasRealmRole(role);
  }

  /** Verifica se o usuário possui uma role de recurso */
  hasResourceRole(role: string, resource?: string): boolean {
    return this.auth.hasResourceRole(role, resource);
  }

  /** Retorna o token atual */
  getToken(): string | undefined {
    return this.auth.getToken();
  }

  /** Atualiza o token se necessário */
  async updateToken(minValidity = 30): Promise<boolean> {
    return this.auth.updateToken(minValidity);
  }

  /** Registra listener para eventos do Keycloak */
  onEvent(event: KeycloakAuthEvent, listener: () => void): () => void {
    return this.auth.onEvent(event, listener);
  }

  /** Acesso direto ao estado atual (snapshot) */
  get state(): KeycloakAuthState {
    return this.auth.state;
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    this.auth.destroy();
    this.stateSubject.complete();
  }
}
