const int = (name, fallback) => {
  const raw = process.env[name];
  return raw === undefined || raw === '' ? fallback : Number.parseInt(raw, 10);
};

const list = (name, fallback) => {
  const raw = process.env[name];
  return raw === undefined || raw === '' ? fallback : raw.split(',').map((s) => s.trim()).filter(Boolean);
};

export const config = {
  port: int('PORT', 3000),
  // The most keys one request may ask for, whatever `count` says.
  maxKeysPerRequest: int('MAX_KEYS_PER_REQUEST', 50),
  // Empty leaves the API open. Set it to require an X-API-Key header.
  apiKeys: list('API_KEYS', []),
};
