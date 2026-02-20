import { useState, useEffect, useRef, type ReactNode } from 'react';
import { KeycloakAuth } from '../../core/keycloak-auth';
import { INITIAL_STATE } from '../../core/constants';
import type { KeycloakAuthConfig, KeycloakAuthState } from '../../core/types';
import { KeycloakContext } from './keycloak-context';

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
  const [state, setState] = useState<KeycloakAuthState>({ ...INITIAL_STATE });
  const authRef = useRef<KeycloakAuth | null>(null);
  const callbacksRef = useRef({ onAuthSuccess, onAuthError });
  callbacksRef.current = { onAuthSuccess, onAuthError };

  useEffect(() => {
    const auth = new KeycloakAuth(config);
    authRef.current = auth;

    const unsubscribe = auth.onStateChange(setState);

    auth
      .init()
      .then((authenticated) => {
        if (authenticated) callbacksRef.current.onAuthSuccess?.();
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        callbacksRef.current.onAuthError?.(err);
      });

    return () => {
      unsubscribe();
      auth.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- inicializa apenas uma vez

  return (
    <KeycloakContext.Provider value={{ ...state, auth: authRef.current }}>
      {state.initialized ? children : loadingComponent}
    </KeycloakContext.Provider>
  );
}
