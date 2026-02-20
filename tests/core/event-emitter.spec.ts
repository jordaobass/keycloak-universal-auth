import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '@/core/event-emitter';

describe('EventEmitter', () => {
  it('should_call_listener_when_event_is_emitted', () => {
    const emitter = new EventEmitter<'test'>();
    const listener = vi.fn();

    emitter.on('test', listener);
    emitter.emit('test');

    expect(listener).toHaveBeenCalledOnce();
  });

  it('should_call_multiple_listeners_for_same_event', () => {
    const emitter = new EventEmitter<'test'>();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on('test', listener1);
    emitter.on('test', listener2);
    emitter.emit('test');

    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });

  it('should_not_call_listener_for_different_event', () => {
    const emitter = new EventEmitter<'a' | 'b'>();
    const listener = vi.fn();

    emitter.on('a', listener);
    emitter.emit('b');

    expect(listener).not.toHaveBeenCalled();
  });

  it('should_unsubscribe_listener_when_calling_returned_function', () => {
    const emitter = new EventEmitter<'test'>();
    const listener = vi.fn();

    const unsubscribe = emitter.on('test', listener);
    unsubscribe();
    emitter.emit('test');

    expect(listener).not.toHaveBeenCalled();
  });

  it('should_remove_all_listeners_when_calling_removeAll', () => {
    const emitter = new EventEmitter<'a' | 'b'>();
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    emitter.on('a', listenerA);
    emitter.on('b', listenerB);
    emitter.removeAll();
    emitter.emit('a');
    emitter.emit('b');

    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).not.toHaveBeenCalled();
  });

  it('should_not_throw_when_emitting_event_without_listeners', () => {
    const emitter = new EventEmitter<'test'>();

    expect(() => emitter.emit('test')).not.toThrow();
  });

  it('should_catch_errors_from_listeners_without_breaking_others', () => {
    const emitter = new EventEmitter<'test'>();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badListener = vi.fn(() => { throw new Error('boom'); });
    const goodListener = vi.fn();

    emitter.on('test', badListener);
    emitter.on('test', goodListener);
    emitter.emit('test');

    expect(badListener).toHaveBeenCalledOnce();
    expect(goodListener).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();

    errorSpy.mockRestore();
  });
});
