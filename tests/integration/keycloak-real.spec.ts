/**
 * Teste de integração real contra Keycloak rodando no Docker.
 *
 * Pré-requisito: docker compose up -d
 *
 * Valida que a lib consegue se comunicar com um Keycloak real,
 * obter tokens e verificar roles.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll } from 'vitest';

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'test-realm';
const CLIENT_ID = 'test-app';
const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
const USERINFO_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`;

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/** Obtém token via Direct Access Grant (Resource Owner Password) */
async function getToken(username: string, password: string): Promise<TokenResponse> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: CLIENT_ID,
      username,
      password,
      scope: 'openid profile email',
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter token: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/** Obtém informações do usuário usando o token */
async function getUserInfo(token: string): Promise<Record<string, unknown>> {
  const response = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter userinfo: ${response.status}`);
  }

  return response.json();
}

/** Decodifica o payload de um JWT (sem validar assinatura) */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
  return JSON.parse(decoded);
}

/** Atualiza o token usando refresh_token */
async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshTokenValue,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao fazer refresh: ${response.status}`);
  }

  return response.json();
}

describe('Integração real com Keycloak', () => {
  let keycloakAvailable = false;

  beforeAll(async () => {
    try {
      const res = await fetch(`${KEYCLOAK_URL}/realms/${REALM}`, {
        signal: AbortSignal.timeout(3000),
      });
      keycloakAvailable = res.ok;
    } catch {
      keycloakAvailable = false;
    }

    if (!keycloakAvailable) {
      console.warn(
        '\n⚠️  Keycloak não está rodando. Execute: docker compose up -d\n' +
        '   Testes de integração serão pulados.\n',
      );
    }
  });

  describe('Autenticação com usuário comum', () => {
    it('should_authenticate_testuser_and_return_valid_token', async () => {
      if (!keycloakAvailable) return;

      const result = await getToken('testuser', 'testpass123');

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBeGreaterThan(0);
    });

    it('should_return_correct_user_info', async () => {
      if (!keycloakAvailable) return;

      const { access_token } = await getToken('testuser', 'testpass123');
      const userInfo = await getUserInfo(access_token);

      expect(userInfo.preferred_username).toBe('testuser');
      expect(userInfo.email).toBe('testuser@example.com');
    });

    it('should_include_user_role_in_token', async () => {
      if (!keycloakAvailable) return;

      const { access_token } = await getToken('testuser', 'testpass123');
      const payload = decodeJwtPayload(access_token);
      const realmAccess = payload.realm_access as { roles: string[] };

      expect(realmAccess.roles).toContain('user');
      expect(realmAccess.roles).not.toContain('admin');
    });
  });

  describe('Autenticação com usuário admin', () => {
    it('should_authenticate_adminuser_and_return_valid_token', async () => {
      if (!keycloakAvailable) return;

      const result = await getToken('adminuser', 'adminpass123');

      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
    });

    it('should_include_admin_and_user_roles_in_token', async () => {
      if (!keycloakAvailable) return;

      const { access_token } = await getToken('adminuser', 'adminpass123');
      const payload = decodeJwtPayload(access_token);
      const realmAccess = payload.realm_access as { roles: string[] };

      expect(realmAccess.roles).toContain('user');
      expect(realmAccess.roles).toContain('admin');
    });
  });

  describe('Refresh token', () => {
    it('should_refresh_token_successfully', async () => {
      if (!keycloakAvailable) return;

      const initial = await getToken('testuser', 'testpass123');
      const refreshed = await refreshToken(initial.refresh_token);

      expect(refreshed.access_token).toBeDefined();
      expect(refreshed.access_token).not.toBe(initial.access_token);
    });
  });

  describe('Cenários de erro', () => {
    it('should_reject_invalid_credentials', async () => {
      if (!keycloakAvailable) return;

      await expect(
        getToken('testuser', 'senha-errada'),
      ).rejects.toThrow('Falha ao obter token: 401');
    });

    it('should_reject_nonexistent_user', async () => {
      if (!keycloakAvailable) return;

      await expect(
        getToken('usuario-fantasma', 'qualquer'),
      ).rejects.toThrow('Falha ao obter token: 401');
    });

    it('should_reject_invalid_token_for_userinfo', async () => {
      if (!keycloakAvailable) return;

      await expect(
        getUserInfo('token-invalido'),
      ).rejects.toThrow('Falha ao obter userinfo: 401');
    });
  });
});
