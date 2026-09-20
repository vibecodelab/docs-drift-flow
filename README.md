# docs-drift-flow

A demo of documentation that repairs itself, using a
[Claude Code routine](https://code.claude.com/docs/en/routines):

```
merged PR ──▶ weekly routine ──▶ docs PR ──label──▶ workflow ──▶ main
                  (judgement)                       (checks)
```

The service is a throwaway: a key generator with five parameters. The point is
everything around it — what happens to the reference documentation in
`docs/content/` when someone changes those five parameters and forgets the docs.

## The split

A routine writes the prose, because deciding which sentences are now false is
judgement. A GitHub Actions workflow decides whether that PR may merge, because
"did this change documentation and nothing else, and do the tests still pass" is
not judgement — and an agent should not be the one certifying its own work.

Concretely, once a week the routine:

1. Lists merged PRs that do not carry the `docs-checked` label
2. Keeps the ones that touched the API surface, and stops if none did
3. Reads the current code, not just the diffs, and corrects `docs/content/`
4. Opens one PR for the batch, labelling it `docs-auto` only if every change
   restates a fact it read in the code
5. Labels the source PRs **last**, so a failed run is retried next week rather
   than silently skipped

[`.github/workflows/docs-auto-merge.yml`](.github/workflows/docs-auto-merge.yml)
then merges a `docs-auto` PR if, and only if, the diff is confined to
`docs/content/` and `README.md` and `npm test` passes. A PR the routine was
unsure about waits for a person.

## Layout

| Path | What it is |
| --- | --- |
| `src/` | The key generator. `schemas/keys.js` holds the parameter spec that the docs describe |
| `docs/content/` | The reference documentation, one Markdown file per section |
| `routine/prompt.md` | The routine's instructions. Its saved prompt is only a pointer to this file, so changing its behaviour is an ordinary pull request |
| `.github/workflows/` | The merge gate, and the tests |

## Run it locally

```bash
npm install
npm test
npm start
curl -X POST 'http://localhost:3000/v1/keys?count=3&alphabet=hex'
```

## Set up the routine

1. Install the [Claude GitHub App](https://github.com/apps/claude) on this
   repository, so cloud sessions can clone it and open pull requests.
2. At [claude.ai/code/routines](https://claude.ai/code/routines), create a
   routine pointing at this repository, with a weekly schedule trigger and this
   prompt:

   > You keep this repository's documentation in step with its API, once a week.
   > Your instructions live in the repository, at `routine/prompt.md`. Read that
   > file first and follow it exactly. If it is missing or unreadable, stop and
   > report that.

3. Turn on **Email** under the routine's **Notifications** tab. A run that finds
   nothing stays quiet, so silence is the normal result.

## See it work

The repository ships consistent: the docs match the code exactly. To create
drift, merge a pull request that changes the API and leaves the documentation
alone — for example, raising the default `length` in
[`src/schemas/keys.js`](src/schemas/keys.js) from 24 to 32, or narrowing
`count` from 50 to 25.

Then open the routine and click **Run now** rather than waiting for Monday. It
should find that PR unlabelled, notice the documented default no longer matches
the code, and open a PR fixing `docs/content/03-parameters.md` — including the
worked example in `01-overview.md` that quoted the old default.

## What it doesn't do

Watch direct pushes. The routine looks at merged pull requests, so anything
pushed straight to `main` is invisible to it. On a public repository you can
close that gap with a ruleset requiring pull requests for `main`.

Catch behaviour that leaves no trace in the surface. Rewrite how keys are
generated while keeping every parameter, default and response identical, and
prose describing the old behaviour survives unchallenged.
