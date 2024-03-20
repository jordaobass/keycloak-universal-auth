import { useState, useEffect, useRef, type ReactNode } from 'react';
import { KeycloakAuth } from '../../core/keycloak-auth';
import type { KeycloakAuthConfig, KeycloakAuthState } from '../../core/types';
import { KeycloakContext } from './keycloak-context';

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

export interface KeycloakProviderProps {
  config: KeycloakAuthConfig;
  children: ReactNode;
  /** Componente exibido durante a inicialização */
  loadingComponent?: ReactNode;
  /** Callback executado após autenticação bem sucedida */
  onAuthSuccess?: () => void;
  /** Callback executado em caso de erro na autenticação */
  onAuthError?: (error: Error) => void;
}

/**
 * Provider que inicializa o Keycloak e disponibiliza o estado via Context.
 *
 * Uso:
 * <KeycloakProvider config={{ url, realm, clientId }}>
 *   <App />
 * </KeycloakProvider>
 */
export function KeycloakProvider({
  config,
  children,
  loadingComponent = null,
  onAuthSuccess,
  onAuthError,
}: KeycloakProviderProps) {
  const [state, setState] = useState<KeycloakAuthState>(INITIAL_STATE);
  const authRef = useRef<KeycloakAuth | null>(null);

  useEffect(() => {
    const auth = new KeycloakAuth(config);
    authRef.current = auth;

    const unsubscribe = auth.onStateChange(setState);

    auth
      .init()
      .then((authenticated) => {
        if (authenticated) onAuthSuccess?.();
      })
      .catch((error) => {
        onAuthError?.(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      unsubscribe();
      auth.destroy();
    };
  }, []);

  return (
    <KeycloakContext.Provider value={{ ...state, auth: authRef.current }}>
      {state.initialized ? children : loadingComponent}
    </KeycloakContext.Provider>
  );
}
