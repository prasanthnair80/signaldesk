import { detectCorrelation, CORRELATION_WINDOW_MS, CORRELATION_THRESHOLD } from '../src/correlator';
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

// Helper: ISO timestamp at now + offsetMs
function tsAt(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

describe('detectCorrelation', () => {
  it('returns null when fewer than 3 events exist', () => {
    const events = [
      makeEvent({ timestamp: tsAt(0) }),
      makeEvent({ timestamp: tsAt(10_000) }),
    ];
    expect(detectCorrelation(events)).toBeNull();
  });

  it('returns null when 3 same-category events are spread across more than 60 seconds', () => {
    const events = [
      makeEvent({ timestamp: tsAt(0) }),
      makeEvent({ timestamp: tsAt(30_000) }),
      makeEvent({ timestamp: tsAt(70_000) }), // 70 s after first — outside window
    ];
    expect(detectCorrelation(events)).toBeNull();
  });

  it('returns null when no single category reaches the threshold', () => {
    // 2 billing + 1 error — neither reaches CORRELATION_THRESHOLD of 3
    const events = [
      makeEvent({ category: 'billing', type: 'invoice.payment_failed', timestamp: tsAt(0) }),
      makeEvent({ category: 'error',   type: 'charge.failed',          timestamp: tsAt(5_000) }),
      makeEvent({ category: 'billing', type: 'charge.',                 timestamp: tsAt(10_000) }),
    ];
    expect(detectCorrelation(events)).toBeNull();
  });

  it('detects a signal when 3 same-category events arrive within 60 seconds', () => {
    const events = [
      makeEvent({ timestamp: tsAt(0) }),
      makeEvent({ timestamp: tsAt(20_000) }),
      makeEvent({ timestamp: tsAt(40_000) }),
    ];
    const signal = detectCorrelation(events);
    expect(signal).not.toBeNull();
    expect(signal?.category).toBe('error');
    expect(signal?.events).toHaveLength(CORRELATION_THRESHOLD);
  });

  it('finds the earliest qualifying window when multiple exist', () => {
    const events = [
      makeEvent({ timestamp: tsAt(0) }),
      makeEvent({ timestamp: tsAt(10_000) }),
      makeEvent({ timestamp: tsAt(20_000) }),  // first window: 0–20s (within 60s)
      makeEvent({ timestamp: tsAt(200_000) }), // well outside first window
    ];
    const signal = detectCorrelation(events);
    expect(signal).not.toBeNull();
    // Signal should use the first 3 events, not include the 200s outlier
    expect(signal?.events[signal.events.length - 1].timestamp).not.toBe(tsAt(200_000));
  });
});
