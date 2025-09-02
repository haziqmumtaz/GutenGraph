import Router from '@koa/router';
import { TYPES } from '../types/di.js';
import { container } from '../container.js';
import type { Gutenberg } from '../services/gutenberg.service.js';
import type { Middleware } from 'koa';
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

    ctx.body = await gutenbergService.fetchBookMetadata(bookId);

    await next();
  };
};

export const createBooksRouter = () => {
  const router = new Router({ prefix: '/books' });

  router.get('/:bookId', getBooks());

  return router;
};
