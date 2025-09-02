import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  apiPrefix: z.string().default('/api'),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse({
  port: process.env['PORT'],
  nodeEnv: process.env['NODE_ENV'],
  apiPrefix: process.env['API_PREFIX'],
});
