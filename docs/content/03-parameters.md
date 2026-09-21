# Parameters

Every parameter is optional and goes in the query string.
[`GET /v1/parameters`](#) returns the same list in machine-readable form.

| Parameter | Values | Default | Notes |
|---|---|---|---|
| `length` | integer 8–128 | `32` | Characters generated, not counting any prefix |
| `count` | integer 1–25 | `1` | Keys returned in one response |
| `alphabet` | `base58` `hex` `alphanumeric` | `base58` | Character set to draw from |
| `excludeAmbiguous` | boolean | `true` | Leaves out `0 O o 1 l I 5 S 8 B` |
| `prefix` | string, up to 16 characters | empty | Added to the front of every key |

## Alphabets

| Name | Characters |
|---|---|
| `base58` | Digits and letters, without `0`, `O`, `I` and `l` |
| `hex` | `0`–`9` and `a`–`f` |
| `alphanumeric` | All digits and letters, upper and lower case |

Asking for `hex` together with `excludeAmbiguous=true` leaves ten usable
characters, so a hex key carries less entropy per character than its length
suggests.
