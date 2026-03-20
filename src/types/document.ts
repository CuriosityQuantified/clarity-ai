export interface Document {
  id: string;
  title: string;
  subtitle: string;
  authors: string[];
  date: string;
  source: string;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  id: string;
  text: string;
}

export interface SourceVerification {
  selectedText: string;
  directQuote: string;
  sourceUrl: string;
  sourceDomain: string;
  confidenceScore: number;
  verified: boolean;
}
