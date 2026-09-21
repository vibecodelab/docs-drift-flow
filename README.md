# docs-drift-flow

A demo of documentation that repairs itself, using a
[Claude Code routine](https://code.claude.com/docs/en/routines):

```
merged PR ──▶ weekly routine ──▶ docs PR ──▶ you review and merge
```

The service is a throwaway: a key generator with five parameters. The point is
everything around it — what happens to the reference documentation in
`docs/content/` when someone changes those five parameters and forgets the docs.

## How it works

Once a week, the routine:

1. Lists merged PRs that do not carry the `docs-checked` label
2. Keeps the ones that touched the API surface, and stops if none did
3. Reads the current code, not just the diffs, and corrects `docs/content/`
4. Opens one PR for the batch, listing what the code now does against what the
   docs said, and flagging anything it was unsure of
5. Labels the source PRs **last**, so a failed run is retried next week rather
   than silently skipped

The routine writes the prose, because deciding which sentences are now false is
judgement. A person decides whether it merges.

### Auto-merge, available but switched off

[`.github/workflows/docs-auto-merge.yml`](.github/workflows/docs-auto-merge.yml)
can take that last step too. It merges a docs PR only if the diff is confined to
`docs/content/` and `README.md` and the tests pass — the checks an agent
shouldn't certify for itself. It is **disabled** here, so every docs PR waits
for review.

To turn it on, run `gh workflow enable "Docs auto-merge"`, and add a step to
[`routine/prompt.md`](routine/prompt.md) telling the routine to label a PR
`docs-auto` when every change restates a fact it read in the code. The workflow
acts only on that label, so an unlabelled PR still waits for a person.

## Layout

| Path | What it is |
| --- | --- |
| `src/` | The key generator. `schemas/keys.js` holds the parameter spec that the docs describe |
| `docs/content/` | The reference documentation, one Markdown file per section |
| `routine/prompt.md` | The routine's instructions. Its saved prompt is only a pointer to this file, so changing its behaviour is an ordinary pull request |
| `.github/workflows/` | The tests, and the auto-merge gate (disabled) |

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
drift, merge the `demo/longer-keys` branch. It raises the default `length` in
[`src/schemas/keys.js`](src/schemas/keys.js) from 24 to 32 and narrows `count`
from 50 to 25, updating the tests but deliberately not the docs.

Then open the routine and click **Run now** rather than waiting for Monday. It
should find that PR unlabelled, notice the documented default and range no
longer match the code, and open a PR fixing `docs/content/03-parameters.md`.
Review it and merge.

## What it doesn't do

Watch direct pushes. The routine looks at merged pull requests, so anything
pushed straight to `main` would be invisible to it. This repository closes that
gap with a ruleset: changes to `main` must arrive as pull requests.

Catch behaviour that leaves no trace in the surface. Rewrite how keys are
generated while keeping every parameter, default and response identical, and
prose describing the old behaviour survives unchallenged.
