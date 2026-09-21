# Generate keys

### POST /v1/keys

Returns one or more freshly generated keys. Every parameter is optional.

```bash
curl -X POST 'http://localhost:3000/v1/keys?length=16&alphabet=hex&prefix=sk_'
```

```json
{
  "keys": ["sk_3e246ea26d43f4dc"],
  "count": 1,
  "length": 16,
  "alphabet": "hex"
}
```

`length` counts the generated characters only. A `prefix` is added afterwards,
so `prefix=sk_&length=16` returns a 19-character string.

By default the generator leaves out characters that are easy to misread —
`0`, `O`, `o`, `1`, `l`, `I`, `5`, `S`, `8` and `B`. Send
`excludeAmbiguous=false` to use the full alphabet, which gives each character
slightly more entropy.

### GET /v1/parameters

Returns every accepted parameter with its type, range and default, plus the
server's limits. Worth calling once when you integrate rather than assuming.

### GET /health

Returns `{"status":"ok"}` while the process is up. Never requires a key.
