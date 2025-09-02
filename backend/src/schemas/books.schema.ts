import { z } from 'zod';

export const bookResponseSchema = z.object({
  titleGuess: z.string(),
  authorGuess: z.string(),
  raw: z.string(),
});

export const httpErrorSchema = z.object({
  status: z.number(),
  error: z.string(),
  message: z.string(),
});

export type BookResponse = z.infer<typeof bookResponseSchema>;
export type HttpError = z.infer<typeof httpErrorSchema>;
