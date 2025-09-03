export const TYPES = {
  GutenbergService: Symbol.for('GutenbergService'),
  GroqService: Symbol.for('GroqService'),
  AnalysisService: Symbol.for('AnalysisService'),
  Router: Symbol.for('Router'),
} as const;

export type DITypes = typeof TYPES;
