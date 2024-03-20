/** Erro base da biblioteca */
export class KeycloakAuthError extends Error {
  constructor(message: string) {
    super(`[keycloak-universal-auth] ${message}`);
    this.name = 'KeycloakAuthError';
  }
}

/** Erro ao inicializar o Keycloak */
export class KeycloakInitError extends KeycloakAuthError {
  constructor(message = 'Falha ao inicializar o Keycloak') {
    super(message);
    this.name = 'KeycloakInitError';
  }
}

/** Erro ao fazer refresh do token */
export class TokenRefreshError extends KeycloakAuthError {
  constructor(message = 'Falha ao atualizar o token') {
    super(message);
    this.name = 'TokenRefreshError';
  }
}
