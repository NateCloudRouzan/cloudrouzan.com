# Restoration learnings

## Evidence and context
Prepared on 2026-11-15 from repository commit `0544cc1` (Configure Cloudflare Workers
deployment), its initial predecessor `9fd3a30`, and the earlier chat titled
“Restore Cloudrouzan Domain.” The available chat record includes the owner's confirmation
on 2026-11-13 that the site appeared online. Screenshots and the live Cloudflare account
were not independently audited while writing these docs. Historical assistant advice is
context, not proof of current dashboard settings.

## What the restoration established
| Topic | Learning and practical consequence |
| --- | --- |
| Registrar versus hosting | Keep Squarespace registration and renewal; hosting the site on Workers does not require a domain transfer. |
| DNS versus registrar | The chat records Cloudflare DNS while Squarespace remains registrar. Check authoritative nameservers before making future DNS edits. |
| Static hosting | React/TypeScript is compiled by Vite into `dist/`, served by Worker static assets without a maintained server. |
| Wrangler config | The restoration identified a missing `compatibility_date` deployment failure. The current file contains `2026-11-10`, Worker name `cloudrouzan`, and `assets.directory: ./dist`. |
| Custom Domain | The apex `cloudrouzan.com` was attached to the Worker for production, and the owner subsequently reported it working. `www` was suggested separately. |
| GitHub integration | The chat reports automatic deployment from `main`; actual build commands and branch publishing filters live in Cloudflare and need verification. |
| Git authentication | GitHub CLI interactive authentication can support HTTPS Git. Credentials belong in the credential store, never the repository. |
| Two release paths | GitHub-triggered builds preserve a source trail. Direct CLI deployment is possible but can drift from GitHub or be overwritten by another build. |

The exact original deployment error text is not available in the retrieved record, so it
is not reproduced as a verbatim error. See [DEPLOYMENT.md](DEPLOYMENT.md) for diagnostics
rather than treating every build failure as the old compatibility-date issue.

## Corrections to earlier starter advice
- The starter README suggests Pages or Vercel generically. The restored site uses
  **Cloudflare Workers**; do not provision a second hosting project.
- Earlier chat examples used `npm ci`. This snapshot has no committed lockfile, so use
  `npm install --package-lock=false` until a lockfile is deliberately introduced.
- `npm run build` runs only Vite. Add the separate TypeScript checker to validation.
- Neither Node nor Wrangler is pinned. Fresh installs may differ even with unchanged
  source. Record versions when diagnosing failures.
- “Push to GitHub” is not a universal safe instruction: `main` can deploy production,
  and feature branches may publish previews depending on account settings.
- The earlier local folder was `~/Downloads/cloudrouzan-starter`; a permanent checkout
  is preferable, but no workflow should assume that old path exists.

## Preserve these boundaries
Keep documentation with source so remote development has the same context as local
work. Use branches, PR history, and validation under the solo workflow below. Preserve the existing
Worker identity, domain registration, DNS and mail settings. Do not grant production
credentials just to edit content or validate builds.

## Add future learnings
For each incident or operational change, record the date, symptom, failing commit/tool
versions, evidence, root cause, approved fix, validation, and prevention step. Redact
credentials and private account details. Clearly label observations, assumptions, and
unverified dashboard state.

## Follow-up evidence: 2026-11-15
The owner supplied a screenshot of the existing Worker's Production build settings. It
confirms repository `NateCloudRouzan/cloudrouzan.com`, production branch `main`, builds
enabled, root `/`, build command `npm run build`, and deploy command
`npx wrangler deploy --assets ./dist`. The Previews Base tab is visible but not selected,
so feature-branch/PR preview publishing is still unknown. No infrastructure settings were
changed in response to this screenshot.

A second owner screenshot on 2026-11-15 confirms Previews Base has preview branch builds
enabled, build command `npm run build`, preview command `npx wrangler preview`, root `/`,
and include watch path `*`. Feature-branch publishing is therefore potentially a preview
release. The documentation branch remains local pending approval to publish a preview or
confirmation that preview builds have been disabled. No settings were changed.

## Solo workflow decision: 2026-11-16
The owner requested asynchronous development and deployment without a second reviewer
or an additional approval step. Routine pushes, previews, completed-work merges, releases,
and known-good recovery are now authorized. Initial approval restrictions above are
historical, not current policy. Keep unfinished PRs open, respect task-specific limits,
and preserve DNS/registrar/access boundaries. GitHub has no rulesets or protection on
`main`; auto-merge is enabled at repository level, with no required human reviews added.
