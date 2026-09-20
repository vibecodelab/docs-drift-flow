import Fastify from 'fastify';
import { config } from './config.js';
import { ApiError, tooManyKeys, unauthorized } from './errors.js';
import { SPEC, parseParams } from './schemas/keys.js';
import { generateKey } from './generate.js';

export function buildServer() {
  const app = Fastify({ logger: false });

  if (config.apiKeys.length > 0) {
    const keys = new Set(config.apiKeys);
    app.addHook('onRequest', async (request) => {
      if (request.url.startsWith('/health')) return;
      if (!keys.has(request.headers['x-api-key'])) throw unauthorized();
    });
  }

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) return reply.code(error.statusCode).send(error.toJSON());
    return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  });

  app.post('/v1/keys', async (request) => {
    const params = parseParams({ ...request.query });
    if (params.count > config.maxKeysPerRequest) {
      throw tooManyKeys(`This server issues at most ${config.maxKeysPerRequest} keys per request`);
    }

    const keys = Array.from({ length: params.count }, () => generateKey(params));
    return { keys, count: keys.length, length: params.length, alphabet: params.alphabet };
  });

  app.get('/v1/parameters', async () => ({
    parameters: SPEC,
    limits: { maxKeysPerRequest: config.maxKeysPerRequest },
  }));

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

if (process.argv[1]?.endsWith('server.js')) {
  const app = buildServer();
  await app.listen({ host: '0.0.0.0', port: config.port });
}
