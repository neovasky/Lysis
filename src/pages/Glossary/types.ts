/**
 * File: src/pages/Glossary/types.ts
 * Description: Type definitions for the glossary feature
 */

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition: string;
  fullDefinition: string;
  linkedTerms?: { term: string; definition: string }[];
  formula?: string;
  formulaExplanation?: string;
  relatedTerms?: string[];
  categories?: string[];
}

export interface Filter {
  id: string;
  label: string;
  icon: JSX.Element;
}
