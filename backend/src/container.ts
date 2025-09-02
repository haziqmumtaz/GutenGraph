import 'reflect-metadata';
import { Container } from 'inversify';

import { TYPES } from './types/di.js';
import { ApiRouter, type Mountable } from './http/index.js';
import { Gutenberg, GutenbergService } from './services/gutenberg.service.js';
const container = new Container();

container.bind<GutenbergService>(TYPES.GutenbergService).to(Gutenberg);

container.bind<Mountable>(TYPES.Router).to(ApiRouter);

export { container };
