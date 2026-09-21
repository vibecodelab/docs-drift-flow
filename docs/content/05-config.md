# Server configuration

Environment variables for whoever runs the service.

| Variable | Default | Effect |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `MAX_KEYS_PER_REQUEST` | `50` | Largest `count` accepted, whatever the parameter allows |
| `API_KEYS` | empty | Comma-separated keys required in `X-API-Key`. Empty leaves the API open |

`MAX_KEYS_PER_REQUEST` is a ceiling on top of the `count` parameter, not a
replacement for it: lowering it to `10` makes `count=25` return `422`, while
`count=100` still returns `400` because it is outside the parameter's own range.

The default of `50` is above `count`'s own maximum of `25`, so with the default
in place no request can reach the ceiling: you only see `422` once you set
`MAX_KEYS_PER_REQUEST` below `25`.
