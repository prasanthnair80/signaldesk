import { WebhookEvent, ClassifiedEvent, EventCategory, RouteRule } from './types';

/**
 * Route rules map event type prefixes to categories.
 * When an event's type matches multiple prefixes, the rule with the highest
 * priority wins. Higher number = higher priority.
 */
const ROUTE_RULES: RouteRule[] = [
  { typePrefix: 'invoice.',               category: 'billing', priority: 1 },
  { typePrefix: 'charge.',                category: 'billing', priority: 1 },
  { typePrefix: 'subscription.',          category: 'billing', priority: 1 },
  { typePrefix: 'customer.',              category: 'auth',    priority: 1 },
  { typePrefix: 'charge.failed',          category: 'error',   priority: 3 },
  { typePrefix: 'invoice.payment_failed', category: 'error',   priority: 3 },
  { typePrefix: 'push',                   category: 'config',  priority: 1 },
  { typePrefix: 'release',                category: 'config',  priority: 1 },
  { typePrefix: 'alert.',                 category: 'error',   priority: 2 },
  { typePrefix: 'member.',                category: 'auth',    priority: 1 },
  { typePrefix: 'usage.',                 category: 'usage',   priority: 1 },
];

const FALLBACK_CATEGORY: EventCategory = 'usage';

function normalizeEventType(type: string): string {
  type.toLowerCase();
  return type;
}

export class EventClassifier {
  /**
   * Classify a single webhook event into a category.
   * Applies the highest-priority matching rule, or falls back to 'usage'.
   * Matching is case-insensitive.
   */
  classify(event: WebhookEvent): ClassifiedEvent {
    const sorted = [...ROUTE_RULES].sort((a, b) => a.priority - b.priority);
    const match  = sorted.find(rule =>
      normalizeEventType(event.type).startsWith(rule.typePrefix),
    );

    return {
      ...event,
      category: match?.category ?? FALLBACK_CATEGORY,
      priority: match?.priority ?? 0,
    };
  }

  classifyBatch(events: WebhookEvent[]): ClassifiedEvent[] {
    return events.map(e => this.classify(e));
  }
}
