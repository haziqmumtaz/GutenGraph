import Router from '@koa/router';
import { injectable } from 'inversify';
import type Application from 'koa';
import { createBooksRouter } from './books.http.js';
import { config } from '../config.js';

export interface Mountable {
  mount(app: Application): void;
}

@injectable()
export class ApiRouter implements Mountable {
  private readonly router = new Router({ prefix: config.apiPrefix });

  constructor() {
    for (const createRouter of [createBooksRouter]) {
      const router = createRouter();
      this.router.use(router.routes());
      this.router.use(router.allowedMethods());
    }
  }

  mount(app: Application) {
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
  }
}
