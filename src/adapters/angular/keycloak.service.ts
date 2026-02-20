import { Injectable, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';
import { KeycloakAuth } from '../../core/keycloak-auth';
import { INITIAL_STATE } from '../../core/constants';
import type {
  KeycloakAuthConfig,
  KeycloakAuthState,
  KeycloakAuthEvent,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
} from '../../core/types';
import { KEYCLOAK_CONFIG } from './keycloak.tokens';

/** Service Angular que encapsula o core de autenticação Keycloak */
@Injectable({ providedIn: 'root' })
export class KeycloakService implements OnDestroy {
  private readonly auth: KeycloakAuth;
  private readonly stateSubject = new BehaviorSubject<KeycloakAuthState>({ ...INITIAL_STATE });
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

  async init(): Promise<boolean> {
    return this.auth.init();
  }

  async login(options?: KeycloakLoginOptions): Promise<void> {
    return this.auth.login(options);
  }

  async logout(options?: KeycloakLogoutOptions): Promise<void> {
    return this.auth.logout(options);
  }

  hasRealmRole(role: string): boolean {
    return this.auth.hasRealmRole(role);
  }

  hasResourceRole(role: string, resource?: string): boolean {
    return this.auth.hasResourceRole(role, resource);
  }

  getToken(): string | undefined {
    return this.auth.getToken();
  }

  async updateToken(minValidity = 30): Promise<boolean> {
    return this.auth.updateToken(minValidity);
  }

  onEvent(event: KeycloakAuthEvent, listener: () => void): () => void {
    return this.auth.onEvent(event, listener);
  }

  get state(): KeycloakAuthState {
    return this.auth.state;
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    this.auth.destroy();
    this.stateSubject.complete();
  }
}
