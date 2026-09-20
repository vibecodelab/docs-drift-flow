import { badRequest } from '../errors.js';

// The API surface. Every accepted parameter is defined here, and the
// documentation's parameter table is written from it.
export const SPEC = {
  length: { type: 'int', min: 8, max: 128, default: 24 },
  count: { type: 'int', min: 1, max: 50, default: 1 },
  alphabet: { type: 'enum', values: ['base58', 'hex', 'alphanumeric'], default: 'base58' },
  excludeAmbiguous: { type: 'boolean', default: true },
  prefix: { type: 'string', maxLength: 16, default: '' },
};

const TRUE = new Set(['1', 'true', 'yes', 'on']);
const FALSE = new Set(['0', 'false', 'no', 'off']);

function coerce(key, spec, raw) {
  const value = typeof raw === 'string' ? raw.trim() : raw;

  switch (spec.type) {
    case 'boolean': {
      const lower = String(value).toLowerCase();
      if (TRUE.has(lower)) return true;
      if (FALSE.has(lower)) return false;
      throw badRequest(`Parameter "${key}" must be a boolean, got "${value}"`);
    }
    case 'int': {
      const n = Number(value);
      if (!Number.isInteger(n)) throw badRequest(`Parameter "${key}" must be an integer, got "${value}"`);
      if (n < spec.min || n > spec.max) {
        throw badRequest(`Parameter "${key}" must be between ${spec.min} and ${spec.max}, got ${n}`);
      }
      return n;
    }
    case 'enum': {
      const lower = String(value).toLowerCase();
      if (!spec.values.includes(lower)) {
        throw badRequest(`Parameter "${key}" must be one of ${spec.values.join(', ')}, got "${value}"`);
      }
      return lower;
    }
    default: {
      const str = String(value);
      if (str.length > spec.maxLength) {
        throw badRequest(`Parameter "${key}" must be at most ${spec.maxLength} characters`);
      }
      return str;
    }
  }
}

/**
 * Validate and coerce a flat bag of query parameters, filling in defaults.
 * Unknown names are rejected rather than ignored, so a typo fails loudly
 * instead of silently using the default.
 */
export function parseParams(raw = {}) {
  const params = {};
  const unknown = [];

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === '') continue;
    if (!SPEC[key]) {
      unknown.push(key);
      continue;
    }
    params[key] = coerce(key, SPEC[key], value);
  }

  if (unknown.length > 0) {
    throw badRequest(
      `Unknown parameter(s): ${unknown.join(', ')}. Supported: ${Object.keys(SPEC).sort().join(', ')}`,
    );
  }

  for (const [key, spec] of Object.entries(SPEC)) {
    if (params[key] === undefined) params[key] = spec.default;
  }
  return params;
}
