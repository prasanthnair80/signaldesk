export type EventCategory = 'billing' | 'auth' | 'usage' | 'error' | 'config';

export interface WebhookEvent {
  id: string;
  source: string;      // 'stripe', 'github', 'pagerduty', etc.
  type: string;        // 'invoice.payment_failed', 'push', 'alert.triggered', etc.
  timestamp: string;   // ISO 8601
  payload: Record<string, unknown>;
}

export interface ClassifiedEvent extends WebhookEvent {
  category: EventCategory;
  priority: number;    // matched rule priority (0 if fallback)
}

export interface IncidentSignal {
  category: EventCategory;
  events: ClassifiedEvent[];
  detectedAt: string;
  message: string;
}

export interface RouteRule {
  typePrefix: string;
  category: EventCategory;
  priority: number;    // higher = wins when multiple rules match
}
