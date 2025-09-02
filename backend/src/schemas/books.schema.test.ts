import { describe, expect, it } from 'vitest';
import { bookResponseSchema, httpErrorSchema } from './books.schema.js';

describe('Books Schema Validation', () => {
  describe('bookSummarySchema', () => {
    it('should validate valid book summary', () => {
      const validSummary = {
        id: '1234',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
      };
      const result = bookResponseSchema.safeParse(validSummary);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSummary);
      }
    });

    it('should reject summary with missing fields', () => {
      const invalidSummary = {
        id: '1234',
        title: 'Pride and Prejudice',
        // Missing author
      };
      const result = bookResponseSchema.safeParse(invalidSummary);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject summary with wrong types', () => {
      const invalidSummary = {
        id: 1234, // Should be string
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
      };
      const result = bookResponseSchema.safeParse(invalidSummary);

      expect(result.success).toBe(false);
    });

    it('should accept empty strings for title and author', () => {
      const validSummary = {
        id: '1234',
        title: '',
        author: '',
      };
      const result = bookResponseSchema.safeParse(validSummary);

      expect(result.success).toBe(true);
    });
  });

  describe('httpErrorSchema', () => {
    it('should validate valid HTTP error', () => {
      const validError = {
        status: 404,
        error: 'Not Found',
        message: 'Book with ID 1234 not found',
      };
      const result = httpErrorSchema.safeParse(validError);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validError);
      }
    });

    it('should reject error with missing fields', () => {
      const invalidError = {
        status: 500,
        // Missing error and message
      };
      const result = httpErrorSchema.safeParse(invalidError);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject error with wrong types', () => {
      const invalidError = {
        status: '500', // Should be number
        error: 'Internal Server Error',
        message: 'Something went wrong',
      };
      const result = httpErrorSchema.safeParse(invalidError);

      expect(result.success).toBe(false);
    });

    it('should validate different HTTP status codes', () => {
      const validCodes = [400, 401, 403, 404, 500, 503];

      validCodes.forEach(status => {
        const validError = {
          status,
          error: 'Test Error',
          message: 'Test message',
        };
        const result = httpErrorSchema.safeParse(validError);
        expect(result.success).toBe(true);
      });
    });
  });
});
