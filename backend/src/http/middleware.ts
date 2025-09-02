import type { Middleware } from 'koa';
import { toApplicationError } from '../utils/errors.js';
import { isSuccess, type Result } from '../utils/result.js';

export const handleErrors = (): Middleware => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error('Unhandled error:', error);

      const appError = toApplicationError(error);

      ctx.status = appError.status;
      ctx.body = appError;
    }
  };
};

export const handleResults = (): Middleware => {
  return async (ctx, next) => {
    await next();

    if (ctx.body && typeof ctx.body === 'object' && 'success' in ctx.body) {
      const result = ctx.body as Result<unknown>;

      if (isSuccess(result)) {
        ctx.body = result.data;
      } else {
        ctx.status = result.error.status;
        ctx.body = result.error;
      }
    }
  };
};

export const requestLogger = (): Middleware => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
  };
};
