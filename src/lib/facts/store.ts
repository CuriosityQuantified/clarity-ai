import type { VerifiedFact, FactRequest, FactStore, ValidationResult } from './schema';

/**
 * Generate a UUID v4 string.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a highlight URL using the Text Fragment specification.
 * @see https://web.dev/text-fragments/
 */
export function createHighlightUrl(baseUrl: string, quoteText: string): string {
  const encoded = encodeURIComponent(quoteText.trim().slice(0, 200));
  return `${baseUrl}#:~:text=${encoded}`;
}

/**
 * Validate a VerifiedFact, returning errors for any missing or invalid fields.
 */
export function validateFact(fact: VerifiedFact): ValidationResult {
  const errors: string[] = [];

  if (!fact.id) errors.push('id is required');
  if (!fact.quote || fact.quote.trim().length === 0) errors.push('quote is required');
  if (!fact.sourceUrl) errors.push('sourceUrl is required');
  try {
    if (fact.sourceUrl) new URL(fact.sourceUrl);
  } catch {
    errors.push('sourceUrl must be a valid URL');
  }
  if (!fact.highlightUrl) errors.push('highlightUrl is required');
  if (!fact.dateRetrieved) errors.push('dateRetrieved is required');
  if (typeof fact.confidence !== 'number' || fact.confidence < 0 || fact.confidence > 1) {
    errors.push('confidence must be a number between 0 and 1');
  }
  if (!['verified', 'pending', 'failed', 'unavailable'].includes(fact.verificationStatus)) {
    errors.push('verificationStatus must be one of: verified, pending, failed, unavailable');
  }
  if (!fact.gatheredBy) errors.push('gatheredBy is required');

  return { valid: errors.length === 0, errors };
}

/**
 * Create a new VerifiedFact with a generated UUID.
 */
export function createFact(input: Omit<VerifiedFact, 'id'>): VerifiedFact {
  const fact: VerifiedFact = {
    id: generateUUID(),
    ...input,
  };
  const result = validateFact(fact);
  if (!result.valid) {
    console.warn('Created fact has validation issues:', result.errors);
  }
  return fact;
}

/**
 * Search facts by tags, quote content, or context.
 * Case-insensitive substring matching across multiple fields.
 */
export function searchFacts(store: FactStore, query: string): VerifiedFact[] {
  const q = query.toLowerCase();
  return store.facts.filter((fact) => {
    if (fact.quote.toLowerCase().includes(q)) return true;
    if (fact.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
    if (fact.inContext.some((ctx) => ctx.toLowerCase().includes(q))) return true;
    if (fact.outOfContext.some((ctx) => ctx.toLowerCase().includes(q))) return true;
    if (fact.author?.toLowerCase().includes(q)) return true;
    if (fact.publication?.toLowerCase().includes(q)) return true;
    return false;
  });
}

/**
 * Find facts where inContext includes the given context string (case-insensitive).
 */
export function getFactsByContext(store: FactStore, context: string): VerifiedFact[] {
  const c = context.toLowerCase();
  return store.facts.filter((fact) =>
    fact.inContext.some((ctx) => ctx.toLowerCase().includes(c))
  );
}

/**
 * Create a new FactRequest.
 */
export function createFactRequest(query: string, requestedBy: string): FactRequest {
  return {
    id: generateUUID(),
    query,
    requestedBy,
    status: 'pending',
    timestamp: new Date().toISOString(),
    fulfilledFactIds: [],
    notAvailableReason: null,
  };
}

/**
 * Mark a FactRequest as fulfilled with the given fact IDs.
 * Returns a new FactStore (immutable update).
 */
export function fulfillRequest(store: FactStore, requestId: string, factIds: string[]): FactStore {
  return {
    ...store,
    lastUpdated: new Date().toISOString(),
    requests: store.requests.map((req) =>
      req.id === requestId
        ? { ...req, status: 'fulfilled' as const, fulfilledFactIds: factIds }
        : req
    ),
  };
}

/**
 * Mark a FactRequest as not available with a reason.
 * Returns a new FactStore (immutable update).
 */
export function markUnavailable(store: FactStore, requestId: string, reason: string): FactStore {
  return {
    ...store,
    lastUpdated: new Date().toISOString(),
    requests: store.requests.map((req) =>
      req.id === requestId
        ? { ...req, status: 'not_available' as const, notAvailableReason: reason }
        : req
    ),
  };
}
