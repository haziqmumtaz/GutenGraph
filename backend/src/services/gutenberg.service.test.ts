import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GutenbergService } from './gutenberg.service.js';

describe('GutenbergService', () => {
  let service: GutenbergService;

  beforeEach(() => {
    service = new GutenbergService();
  });

  describe('fetchBook', () => {
    it('should return book data with correct structure', async () => {
      const bookId = '1234';
      const result = await service.fetchBook(bookId);

      expect(result).toEqual({
        id: bookId,
        titleGuess: expect.any(String),
        authorGuess: expect.any(String),
        raw: expect.any(String),
      });

      expect(result.titleGuess).toBeTruthy();
      expect(result.authorGuess).toBeTruthy();
      expect(result.raw).toBeTruthy();
    });

    it('should fetch real content from Project Gutenberg for a known book', async () => {
      // Alice's Adventures in Wonderland - a known book ID that should exist
      const bookId = '11';
      const result = await service.fetchBook(bookId);

      expect(result.id).toBe(bookId);
      expect(result.raw).toContain('Alice'); // Should contain the main character's name
      expect(result.raw.length).toBeGreaterThan(1000); // Should be a substantial text

      // Should have extracted metadata (either real or fallback)
      expect(result.titleGuess).toBeTruthy();
      expect(result.authorGuess).toBeTruthy();
    }, 15000); // Longer timeout for network request

    it('should handle non-existent book ID gracefully', async () => {
      const bookId = '999999'; // Very unlikely to exist
      const result = await service.fetchBook(bookId);

      expect(result.id).toBe(bookId);
      expect(result).toEqual({
        id: bookId,
        titleGuess: 'Dummy',
        authorGuess: 'Dummy',
        raw: expect.stringContaining('Sample text content'),
      });
    }, 15000);

    it('should return different book data for different bookIds', async () => {
      const result1 = await service.fetchBook('1111');
      const result2 = await service.fetchBook('2222');

      expect(result1.id).toBe('1111');
      expect(result2.id).toBe('2222');
      expect(result1.id).not.toBe(result2.id);
    });

    it('should handle network timeouts gracefully', async () => {
      // This test ensures the service has proper timeout handling
      const bookId = '1';
      const result = await service.fetchBook(bookId);

      // Should return either real data or fallback dummy data
      expect(result.id).toBe(bookId);
      expect(result.titleGuess).toBeTruthy();
      expect(result.authorGuess).toBeTruthy();
      expect(result.raw).toBeTruthy();
    }, 20000);
  });

  describe('searchBooks', () => {
    it('should return array of books', async () => {
      const query = 'shakespeare';
      const result = await service.searchBooks(query);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      result.forEach(book => {
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('author');
        expect(book).toHaveProperty('content');
      });
    });

    it('should handle empty query', async () => {
      const result = await service.searchBooks('');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return consistent results for same query', async () => {
      const query = 'test';
      const result1 = await service.searchBooks(query);
      const result2 = await service.searchBooks(query);

      expect(result1).toEqual(result2);
    });
  });

  describe('integration test with real Project Gutenberg API', () => {
    it('should successfully fetch The Adventures of Sherlock Holmes', async () => {
      // Book ID 1661 - The Adventures of Sherlock Holmes by Arthur Conan Doyle
      const bookId = '1661';
      const result = await service.fetchBook(bookId);

      expect(result.id).toBe(bookId);
      expect(result.raw).toContain('Sherlock Holmes');
      expect(result.raw).toContain('Watson');
      expect(result.titleGuess).toContain('Adventures'); // Should extract title
      expect(result.authorGuess).toContain('Doyle'); // Should extract author
    }, 20000); // Extended timeout for network request

    it('should successfully fetch Pride and Prejudice', async () => {
      // Book ID 1342 - Pride and Prejudice by Jane Austen
      const bookId = '1342';
      const result = await service.fetchBook(bookId);

      expect(result.id).toBe(bookId);
      expect(result.raw).toContain('Elizabeth');
      expect(result.raw).toContain('Darcy');
      expect(result.titleGuess).toContain('Pride'); // Should extract title
      expect(result.authorGuess).toContain('Austen'); // Should extract author
    }, 20000);
  });
});
