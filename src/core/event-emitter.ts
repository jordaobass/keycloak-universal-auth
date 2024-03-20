/** Event bus tipado para desacoplar callbacks de autenticação */
export class EventEmitter<T extends string> {
  private listeners = new Map<T, Set<() => void>>();

  /** Registra um listener para um evento. Retorna função de unsubscribe */
  on(event: T, listener: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /** Emite um evento, notificando todos os listeners registrados */
  emit(event: T): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error(`[keycloak-universal-auth] Erro no listener do evento ${event}:`, error);
      }
    });
  }

  /** Remove todos os listeners de todos os eventos */
  removeAll(): void {
    this.listeners.clear();
  }
}
