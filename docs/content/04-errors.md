# Errors

Every error uses the same shape:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Parameter \"length\" must be between 8 and 128, got 4"
  }
}
```

| Status | Code | When |
|---|---|---|
| `400` | `BAD_REQUEST` | Unknown parameter, wrong type, or a value outside its range |
| `401` | `UNAUTHORIZED` | Missing or unknown API key, when `API_KEYS` is set |
| `422` | `TOO_MANY_KEYS` | `count` is above the server's `MAX_KEYS_PER_REQUEST` |
| `500` | `INTERNAL_ERROR` | Anything unhandled |

`400` and `422` both mean "your request was understood and refused", but they
fail for different reasons: `400` is a parameter this API never accepts,
`422` is a parameter this *server* is configured not to allow.
