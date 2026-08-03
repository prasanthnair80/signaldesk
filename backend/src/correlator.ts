import { ClassifiedEvent, EventCategory, IncidentSignal } from './types';

export const CORRELATION_WINDOW_MS = 60_000;
export const CORRELATION_THRESHOLD = 3;

/**
 * Return the first IncidentSignal where a single category has
 * CORRELATION_THRESHOLD or more events within a CORRELATION_WINDOW_MS
 * sliding window, or null if no such signal exists.
 *
 * Events may arrive out of order.
 */
export function detectCorrelation(events: ClassifiedEvent[]): IncidentSignal | null {
  return null;
}
