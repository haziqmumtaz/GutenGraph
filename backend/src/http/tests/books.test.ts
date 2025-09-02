import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';

describe('Books HTTP Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.callback())
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        environment: expect.any(String),
      });
    });
  });

  describe('GET /api/books/:bookId', () => {
    it('should return book data when valid bookId is provided', async () => {
      const response = await request(app.callback())
        .get('/api/books/1234')
        .expect(200);

      expect(response.body).toEqual({
        id: '1234',
        title: expect.any(String),
        author: expect.any(String),
      });

      expect(response.body.title).toBeTruthy();
      expect(response.body.author).toBeTruthy();
    });

    it('should return API info when accessing base books endpoint', async () => {
      const response = await request(app.callback())
        .get('/api/books/')
        .expect(200); // Actually hits the base route

      expect(response.body).toEqual({
        message: 'Books API',
        endpoints: {
          'GET /books/:bookId': 'Get a specific book by ID',
          'GET /books/search?q=query': 'Search books by query',
        },
      });
    });

    it('should handle different book IDs', async () => {
      const response1 = await request(app.callback())
        .get('/api/books/111')
        .expect(200);

      const response2 = await request(app.callback())
        .get('/api/books/222')
        .expect(200);

      expect(response1.body.id).toBe('111');
      expect(response2.body.id).toBe('222');
    });
  });

  describe('GET /api/books (base endpoint)', () => {
    it('should return API information', async () => {
      const response = await request(app.callback())
        .get('/api/books')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Books API',
        endpoints: {
          'GET /books/:bookId': 'Get a specific book by ID',
          'GET /books/search?q=query': 'Search books by query',
        },
      });
    });
  });

  describe('GET /api/books/search', () => {
    it('should return search results when query is provided', async () => {
      const response = await request(app.callback())
        .get('/api/books/search?q=shakespeare')
        .expect(200);

      expect(response.body).toHaveProperty('query', 'shakespeare');
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.count).toBe(response.body.results.length);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app.callback())
        .get('/api/books/search')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Query parameter "q" is required');
    });

    it('should handle different search queries', async () => {
      const response1 = await request(app.callback())
        .get('/api/books/search?q=tolkien')
        .expect(200);

      const response2 = await request(app.callback())
        .get('/api/books/search?q=dickens')
        .expect(200);

      expect(response1.body.query).toBe('tolkien');
      expect(response2.body.query).toBe('dickens');
    });

    it('should return 400 for empty search query', async () => {
      const response = await request(app.callback())
        .get('/api/books/search?q=')
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Query parameter "q" is required');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app.callback())
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not found',
        message: 'Route GET /api/nonexistent not found',
      });
    });

    it('should handle invalid HTTP methods gracefully', async () => {
      const response = await request(app.callback())
        .post('/api/books/123')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not found',
        message: 'Route POST /api/books/123 not found',
      });
    });
  });
});
