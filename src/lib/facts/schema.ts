// Pydantic-style TypeScript schema for the fact gathering and verification system

export interface VerifiedFact {
  id: string;                    // UUID
  quote: string;                 // Exact quote text from source
  sourceUrl: string;             // Base URL of the source
  highlightUrl: string;          // URL with #:~:text= fragment for direct verification
  inContext: string[];           // What contexts this fact APPLIES to
  outOfContext: string[];        // What contexts this fact does NOT apply to
  author: string | null;
  publication: string | null;
  datePublished: string | null;
  dateRetrieved: string;         // ISO timestamp
  confidence: number;            // 0-1
  verificationStatus: 'verified' | 'pending' | 'failed' | 'unavailable';
  tags: string[];                // For categorization
  gatheredBy: string;            // Which fact gatherer agent found this
}

export interface FactRequest {
  id: string;
  query: string;                 // What information is needed
  requestedBy: string;           // Which analysis agent requested it
  status: 'pending' | 'fulfilled' | 'not_available';
  timestamp: string;
  fulfilledFactIds: string[];    // IDs of facts that answer this request
  notAvailableReason: string | null;
}

export interface FactStore {
  facts: VerifiedFact[];
  requests: FactRequest[];
  lastUpdated: string;
  version: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
