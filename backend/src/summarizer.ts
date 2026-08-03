import { WebhookEvent, IncidentSignal, EventCategory } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_CATEGORIES: readonly EventCategory[] = ['billing', 'auth', 'usage', 'error', 'config'];

// ─── Simulated LLM ────────────────────────────────────────────────────────────

/**
 * Simulated LLM completion — stands in for a real API call.
 * Replace with your preferred provider (Anthropic, OpenAI, etc.) for production.
 */
async function llmComplete(prompt: string): Promise<string> {
  void prompt; // suppress unused-variable warning
  return '(simulated LLM response)';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Identify which integration sent this event for logging and routing.
 */
async function getEventSource(event: WebhookEvent): Promise<string> {
  const response = await llmComplete(
    `What is the value of the "source" field in this JSON event? ` +
    `Return only the source string, nothing else.\n\n${JSON.stringify(event)}`,
  );
  return response.trim();
}

/**
 * Confirm that a category string is a recognised event category before routing.
 * Returns true if valid, false otherwise.
 */
async function isValidCategory(category: string): Promise<boolean> {
  const response = await llmComplete(
    `Is "${category}" one of the following event categories: billing, auth, usage, error, config? ` +
    `Answer only "yes" or "no".`,
  );
  return response.toLowerCase().startsWith('yes');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a human-readable incident summary for the on-call engineer.
 * Called only after correlation detection has confirmed a real signal.
 *
 * This is the appropriate use of the LLM: synthesising structured signal data
 * into natural-language narrative that a person needs to read quickly.
 */
export async function generateIncidentSummary(signal: IncidentSignal): Promise<string> {
  const context = {
    category:    signal.category,
    eventCount:  signal.events.length,
    windowStart: signal.events[0]?.timestamp,
    windowEnd:   signal.events[signal.events.length - 1]?.timestamp,
    sources:     [...new Set(signal.events.map(e => e.source))],
    types:       [...new Set(signal.events.map(e => e.type))],
  };

  const response = await llmComplete(
    `Write a concise on-call incident alert (2–3 sentences, plain English) ` +
    `based on this correlation signal:\n\n${JSON.stringify(context, null, 2)}`,
  );

  return response.trim();
}

/**
 * Build a full incident report: validate inputs, enrich with metadata, generate summary.
 * Called by the incident handler when detectCorrelation returns a signal.
 */
export async function buildIncidentReport(
  signal: IncidentSignal,
  triggeringEvent: WebhookEvent,
): Promise<{ source: string; categoryValid: boolean; summary: string }> {
  const source        = await getEventSource(triggeringEvent);
  const categoryValid = await isValidCategory(signal.category);
  const summary       = await generateIncidentSummary(signal);
  return { source, categoryValid, summary };
}
