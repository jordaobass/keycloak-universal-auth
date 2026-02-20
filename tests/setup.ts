import { vi } from 'vitest';
import { createKeycloakMock } from './mocks/keycloak-mock';

// Mock global do keycloak-js — reutiliza o mock centralizado
vi.mock('keycloak-js', () => ({
  default: vi.fn().mockImplementation(() => createKeycloakMock()),
}));
