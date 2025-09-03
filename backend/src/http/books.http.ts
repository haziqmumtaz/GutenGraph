import Router from '@koa/router';
import type { Middleware } from 'koa';
import { container } from '../container.js';
import type { Analysis } from '../services/analysis.service.js';
import type { Gutenberg } from '../services/gutenberg.service.js';
import { TYPES } from '../types/di.js';
import { badRequest } from '../utils/errors.js';
import { failure } from '../utils/result.js';

const getBooks = (): Middleware => {
  const gutenbergService = container.get<Gutenberg>(TYPES.GutenbergService);

  return async (ctx, next) => {
    const { bookId } = ctx['params'];

    if (!bookId || typeof bookId !== 'string') {
      ctx.body = failure(badRequest('Book ID parameter is required'));
      return;
    }

    // Fetch metadata
    const metadataResult = await gutenbergService.fetchBookMetadata(bookId);

    if (!metadataResult.success) {
      ctx.body = metadataResult;
      await next();
      return;
    }

    // Download book content in the background
    gutenbergService.downloadBookContent(bookId).catch(error => {
      console.error(`Background download failed for book ${bookId}:`, error);
    });

    // Return metadata immediately
    ctx.body = metadataResult;

    await next();
  };
};

const analyzeBook = (): Middleware => {
  const analysisService = container.get<Analysis>(TYPES.AnalysisService);

  return async (ctx, next) => {
    const { bookId } = ctx['params'];

    if (!bookId || typeof bookId !== 'string') {
      ctx.body = failure(badRequest('Book ID parameter is required'));
      return;
    }

    ctx.body = await analysisService.analyzeBook(bookId);

    await next();
  };
};

export const createBooksRouter = () => {
  const router = new Router({ prefix: '/books' });

  router.get('/:bookId', getBooks());
  router.post('/:bookId/analyse', analyzeBook());
  return router;
};
