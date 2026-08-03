import { EventClassifier } from '../src/classifier';
import { WebhookEvent } from '../src/types';

function makeEvent(overrides: Partial<WebhookEvent> = {}): WebhookEvent {
  return {
    id:        'evt-001',
    source:    'stripe',
    type:      'invoice.payment_succeeded',
    timestamp: new Date().toISOString(),
    payload:   {},
    ...overrides,
  };
}

const classifier = new EventClassifier();

describe('EventClassifier.classify', () => {
  it('classifies invoice events as billing', () => {
    const result = classifier.classify(makeEvent({ type: 'invoice.payment_succeeded' }));
    expect(result.category).toBe('billing');
  });

  it('classifies push events as config', () => {
    const result = classifier.classify(makeEvent({ source: 'github', type: 'push' }));
    expect(result.category).toBe('config');
  });

  it('classifies alert events as error', () => {
    const result = classifier.classify(makeEvent({ source: 'pagerduty', type: 'alert.triggered' }));
    expect(result.category).toBe('error');
  });

  it('falls back to usage for unrecognised event types', () => {
    const result = classifier.classify(makeEvent({ type: 'unknown.event.xyz' }));
    expect(result.category).toBe('usage');
  });

  it('higher-priority rule wins when event type matches multiple prefixes', () => {
    const result = classifier.classify(makeEvent({ type: 'charge.failed' }));
    expect(result.category).toBe('error');
  });

  it('classifies event types correctly regardless of casing', () => {
    const result = classifier.classify(makeEvent({ type: 'Invoice.payment_succeeded' }));
    expect(result.category).toBe('billing');
  });
});
