import type Keycloak from 'keycloak-js';

interface TokenManagerConfig {
  keycloak: Keycloak;
  minValidity: number;
  refreshInterval: number;
  onRefreshSuccess: () => void;
  onRefreshError: (error: Error) => void;
}

/** Gerencia o refresh automático e proativo do token */
export class TokenManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly config: TokenManagerConfig;

  constructor(config: TokenManagerConfig) {
    this.config = config;
  }

  /** Inicia o refresh proativo do token */
  start(): void {
    this.stop();

    const intervalMs = this.config.refreshInterval * 1000;
    this.intervalId = setInterval(() => {
      this.refresh();
    }, intervalMs);
  }

  /** Para o refresh proativo */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Executa o refresh do token */
  async refresh(): Promise<boolean> {
    try {
      const refreshed = await this.config.keycloak.updateToken(
        this.config.minValidity,
      );

      if (refreshed) {
        this.config.onRefreshSuccess();
      }

      return refreshed;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.config.onRefreshError(err);
      return false;
    }
  }
}
