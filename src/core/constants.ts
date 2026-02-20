import type { KeycloakAuthState } from './types';

/** Estado inicial padrão (compartilhado entre core e adaptadores) */
export const INITIAL_STATE: KeycloakAuthState = {
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
