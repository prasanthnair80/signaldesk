import { store } from '../src/store';
import { ClassifiedEvent } from '../src/types';

function makeEvent(overrides: Partial<ClassifiedEvent> = {}): ClassifiedEvent {
  return {
    id:        `evt-${Math.random().toString(36).slice(2, 8)}`,
    source:    'stripe',
    type:      'charge.failed',
    timestamp: new Date().toISOString(),
    payload:   {},
    category:  'error',
    priority:  3,
    ...overrides,
  };
}

beforeEach(() => {
  store.clear();
});

describe('EventStore', () => {
  it('getAll returns all added events', () => {
    store.add(makeEvent());
    store.add(makeEvent());
    expect(store.getAll()).toHaveLength(2);
  });

  it('getAll result is independent of internal state', () => {
    store.add(makeEvent());
    const first = store.getAll();
    first.push(makeEvent());
    expect(store.getAll()).toHaveLength(1);
  });

  it('clear removes all events', () => {
    store.add(makeEvent());
    store.clear();
    expect(store.getAll()).toHaveLength(0);
  });
});
