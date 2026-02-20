import { describe, it, expect } from 'vitest';
import {
  KeycloakAuthError,
  KeycloakInitError,
  TokenRefreshError,
} from '@/core/errors';

describe('Errors', () => {
  it('should_create_KeycloakAuthError_with_prefixed_message', () => {
    const error = new KeycloakAuthError('falha genérica');

    expect(error.message).toBe('[keycloak-universal-auth] falha genérica');
    expect(error.name).toBe('KeycloakAuthError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should_create_KeycloakInitError_with_default_message', () => {
    const error = new KeycloakInitError();

    expect(error.message).toContain('Falha ao inicializar o Keycloak');
    expect(error.name).toBe('KeycloakInitError');
    expect(error).toBeInstanceOf(KeycloakAuthError);
  });

  it('should_create_KeycloakInitError_with_custom_message', () => {
    const error = new KeycloakInitError('timeout');

    expect(error.message).toContain('timeout');
  });

  it('should_create_TokenRefreshError_with_default_message', () => {
    const error = new TokenRefreshError();

    expect(error.message).toContain('Falha ao atualizar o token');
    expect(error.name).toBe('TokenRefreshError');
    expect(error).toBeInstanceOf(KeycloakAuthError);
  });
});
