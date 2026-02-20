import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenManager } from '@/core/token-manager';
import {
  createKeycloakMock,
  asKeycloak,
  type KeycloakMock,
} from '../mocks/keycloak-mock';

describe('TokenManager', () => {
  let kcMock: KeycloakMock;
  let onRefreshSuccess: ReturnType<typeof vi.fn>;
  let onRefreshError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    kcMock = createKeycloakMock();
    onRefreshSuccess = vi.fn();
    onRefreshError = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createManager(
    minValidity = 30,
    refreshInterval = 60,
  ): TokenManager {
    return new TokenManager({
      keycloak: asKeycloak(kcMock),
      minValidity,
      refreshInterval,
      onRefreshSuccess,
      onRefreshError,
    });
  }

  it('should_call_updateToken_on_each_interval_tick', () => {
    const manager = createManager(30, 10);
    kcMock.updateToken.mockResolvedValue(true);

    manager.start();
    vi.advanceTimersByTime(10_000);

    expect(kcMock.updateToken).toHaveBeenCalledWith(30);
    manager.stop();
  });

  it('should_call_onRefreshSuccess_when_token_is_refreshed', async () => {
    const manager = createManager();
    kcMock.updateToken.mockResolvedValue(true);

    const result = await manager.refresh();

    expect(result).toBe(true);
    expect(onRefreshSuccess).toHaveBeenCalledOnce();
  });

  it('should_not_call_onRefreshSuccess_when_token_not_refreshed', async () => {
    const manager = createManager();
    kcMock.updateToken.mockResolvedValue(false);

    const result = await manager.refresh();

    expect(result).toBe(false);
    expect(onRefreshSuccess).not.toHaveBeenCalled();
  });

  it('should_call_onRefreshError_when_updateToken_fails', async () => {
    const manager = createManager();
    kcMock.updateToken.mockRejectedValue(new Error('token expirado'));

    const result = await manager.refresh();

    expect(result).toBe(false);
    expect(onRefreshError).toHaveBeenCalledOnce();
  });

  it('should_stop_interval_when_calling_stop', () => {
    const manager = createManager(30, 5);
    kcMock.updateToken.mockResolvedValue(true);

    manager.start();
    manager.stop();
    vi.advanceTimersByTime(10_000);

    expect(kcMock.updateToken).not.toHaveBeenCalled();
  });

  it('should_clear_previous_interval_when_calling_start_twice', () => {
    const manager = createManager(30, 5);
    kcMock.updateToken.mockResolvedValue(false);

    manager.start();
    manager.start();
    vi.advanceTimersByTime(5_000);

    // Apenas 1 chamada (do segundo start), não 2
    expect(kcMock.updateToken).toHaveBeenCalledTimes(1);
    manager.stop();
  });
});
