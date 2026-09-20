# Overview

Generates random keys over HTTP: API keys, invite codes, short identifiers.
One endpoint does the work, and a handful of parameters control the shape of
what comes back.

```bash
curl -X POST 'http://localhost:3000/v1/keys?length=32&count=3'
```

```json
{
  "keys": ["7kPqXm2vRtNw9bJhGf4sYcZd3nQx", "…", "…"],
  "count": 3,
  "length": 32,
  "alphabet": "base58"
}
```

## Conventions

- Parameters go in the query string. Unknown names are **rejected**, not
  ignored, so `lenght=40` returns `400` with the list of supported names.
- Booleans accept `true`/`false`, `1`/`0`, `yes`/`no` and `on`/`off`.
- Enum values are case-insensitive.

## Authentication

Authentication is off unless the server sets `API_KEYS`. When it is on, send a
key as `X-API-Key: <key>`. A missing or unknown key returns `401 UNAUTHORIZED`.
`GET /health` never needs one.
