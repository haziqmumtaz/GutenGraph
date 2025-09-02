import 'reflect-metadata';
import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env['NODE_ENV'] = 'test';
  process.env['PORT'] = '0';
});
