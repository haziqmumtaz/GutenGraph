import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import { config } from './config.js';
import { container } from './container.js';
import { TYPES } from './types/di.js';
import type { Mountable } from './http/index.js';
import {
  handleErrors,
  handleResults,
  requestLogger,
} from './http/middleware.js';

export const createHttpApp = () => {
  const app = new Koa({
    proxy: true,
  });

  app.use(requestLogger());

  app.use(
    bodyParser({
      enableTypes: ['json', 'form'],
      jsonLimit: '10mb',
      formLimit: '10mb',
    })
  );

  app.use(handleErrors());

  app.use(handleResults());

  app.use(async (ctx, next) => {
    if (ctx.method === 'GET' && ctx.path === `${config.apiPrefix}/health`) {
      ctx.status = 200;
      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      };
      return;
    }
    await next();
  });

  const routers = container.getAll<Mountable>(TYPES.Router);

  for (const router of routers) {
    router.mount(app);
  }

  return app;
};

export const app = createHttpApp();
