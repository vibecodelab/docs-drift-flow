import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../src/server.js';

let app;

beforeAll(async () => {
  app = buildServer();
  await app.ready();
});

afterAll(async () => {
  await app?.close();
});

const post = (url) => app.inject({ method: 'POST', url });

describe('POST /v1/keys', () => {
  it('returns one key of the default length', async () => {
    const res = await post('/v1/keys');
    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.keys).toHaveLength(1);
    expect(body.keys[0]).toHaveLength(32);
  });

  it('honours length and count', async () => {
    const body = (await post('/v1/keys?length=40&count=3')).json();
    expect(body.keys).toHaveLength(3);
    expect(body.keys.every((key) => key.length === 40)).toBe(true);
  });

  it('adds a prefix without counting it toward the length', async () => {
    const key = (await post('/v1/keys?prefix=sk_&length=10')).json().keys[0];
    expect(key.startsWith('sk_')).toBe(true);
    expect(key).toHaveLength(13);
  });

  it('leaves out ambiguous characters unless asked not to', async () => {
    const key = (await post('/v1/keys?length=128&alphabet=alphanumeric')).json().keys[0];
    expect(/[0Oo1lI5S8B]/.test(key)).toBe(false);
  });

  it('rejects unknown parameters rather than ignoring them', async () => {
    const res = await post('/v1/keys?lenght=40');
    expect(res.statusCode).toBe(400);
    expect(res.json().error.message).toContain('lenght');
  });

  it('rejects a length outside the documented range', async () => {
    expect((await post('/v1/keys?length=4')).statusCode).toBe(400);
    expect((await post('/v1/keys?length=999')).statusCode).toBe(400);
  });
});

describe('GET /v1/parameters', () => {
  it('describes every accepted parameter', async () => {
    const body = (await app.inject({ method: 'GET', url: '/v1/parameters' })).json();
    expect(Object.keys(body.parameters).sort()).toEqual([
      'alphabet', 'count', 'excludeAmbiguous', 'length', 'prefix',
    ]);
  });
});
