export const TYPES = {
  GutenbergService: Symbol.for('GutenbergService'),
  Router: Symbol.for('Router'),
} as const;

export type DITypes = typeof TYPES;
