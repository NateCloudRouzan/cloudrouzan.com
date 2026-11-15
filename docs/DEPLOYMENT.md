# Deployment and recovery

## Approval boundary
Production is `https://cloudrouzan.com`, served by the `cloudrouzan` Cloudflare Worker.
Do not merge or deploy without the owner's explicit approval. A push/merge to `main`
can deploy automatically. Direct Wrangler deployment and rollback also change production.
Do not execute release commands below as validation.

Before pushing any feature branch, inspect the existing Worker's Builds settings for
non-production branch builds and preview publishing. Do not assume a PR cannot publish.
If the settings cannot be verified and deployment is prohibited, keep the branch local
and prepare the PR description until the owner confirms safe publishing. Do not disable
builds or modify branch settings without authorization.

## Existing configuration and account checks
The repository declares:

```json
{
  "name": "cloudrouzan",
  "compatibility_date": "2026-11-10",
  "assets": { "directory": "./dist" }
}
```

This is an assets-only Worker, not a Cloudflare Pages project. Wrangler does not have a
custom build command here: build `dist/` explicitly before deploying. No Wrangler package
or version is pinned. `npx wrangler` may download a release; confirm its version and Node
requirements before an authorized release. Pinning it is separate future work.

In Cloudflare's existing `cloudrouzan` Worker, verify these settings without changing them:

| Setting | Expected from restoration / repository |
| --- | --- |
| Connected repository | `NateCloudRouzan/cloudrouzan.com` |
| Production branch | `main` (confirmed in owner screenshot, 2026-11-15) |
| Root directory | `/` (confirmed in owner screenshot, 2026-11-15) |
| Dependency installation | npm install while no lockfile exists; npm ci only after one is committed |
| Build command | `npm run build` (confirmed in owner screenshot, 2026-11-15) |
| Deploy command | `npx wrangler deploy --assets ./dist` (confirmed in owner screenshot, 2026-11-15) |
| Static assets directory | `./dist` in `wrangler.jsonc` |
| Production Custom Domain | `cloudrouzan.com` on Worker `cloudrouzan` |
| Non-production builds | Must be checked before pushing branches; not recorded in Git |

The owner's 2026-11-15 screenshot confirms the connected repository, production branch,
build and deploy commands, root directory, and that production builds are enabled.
The explicit `--assets ./dist` flag matches the asset path in `wrangler.jsonc`.
The screenshot shows the Production tab, not the Previews Base configuration; feature
branch/PR preview publishing remains unverified. Other account settings have not been
independently audited. There is no GitHub Actions
workflow in this snapshot; GitHub-triggered deployment refers to Cloudflare Workers
Builds integration, not an assumed Actions pipeline.

## Preferred release: GitHub -> Workers Builds
1. Make changes on a feature branch, install dependencies, run `npm run build`, and run
   `npx --no-install tsc --noEmit`. Review the diff and inspect UI changes locally.
2. Confirm feature branch publishing is safe, push that branch, and open a PR against
   `main`. Include scope, checks, and any known limitations. Do not enable auto-merge.
3. Obtain explicit owner approval to merge and deploy. Treat merging to `main` as the
   release action because Workers Builds can publish it automatically.
4. After the authorized merge, inspect Cloudflare's build logs and deployed commit SHA.
   Confirm installation, Vite build, and Wrangler deployment all succeeded.
5. Verify the production homepage, CSS/assets, HTTPS, profile links, and mobile layout.
   Record the commit and deployment version. Confirm the domain serves the intended build.

A GitHub push alone does not prove a successful deployment. Avoid overlapping automatic
and manual deployments; an automatic build can replace a manually deployed version.

## Alternative: direct Wrangler CLI release
Only after explicit approval, from the reviewed commit in the repository root:

```sh
git status --short
git rev-parse HEAD
npm install --package-lock=false
npm run build
npx --no-install tsc --noEmit
npx wrangler --version
npx wrangler login
npx wrangler whoami
npx wrangler deploy
```

Stop if the checkout contains unreviewed changes, validation fails, or `whoami` identifies
the wrong account. Confirm the existing `cloudrouzan` Worker and intended account before
running deploy. With no configured environments, do not invent an `--env` value or Worker
name. Do not run project creation or auto-configuration commands.

Wrangler uploads the built assets to the existing Worker; it does not push source to
GitHub. Deploy a reviewed commit already tracked in GitHub and record its SHA to avoid
source/production drift. A future lockfile changes installation to `npm ci`. Interactive
login is suitable for a developer; production tokens should not be supplied to a Codex
editing environment. If unattended releases are later approved, use scoped credentials
in the CI secret store, never in Git or browser code.

## Troubleshooting
| Symptom | Checks and next steps |
| --- | --- |
| `npm ci` fails | No lockfile exists today. Use documented npm install command; do not invent a lockfile during an unrelated change. |
| Build fails | Reproduce locally from the failing SHA; compare Node and package versions and inspect the first useful build error. |
| Missing compatibility date | Restoration history identified this issue. Current `wrangler.jsonc` already includes `2026-11-10`; confirm the build uses this file and repository root. Do not bump the date to fix a path error. |
| Missing entry point/assets or `dist` | Run `npm run build` first; confirm `dist/index.html` exists and `assets.directory` is `./dist`. An assets-only Worker needs no invented script entry point. |
| Push does not deploy | Verify repository permissions, integration, branch, root, trigger filters, and Cloudflare build logs. Do not repeatedly push to production as a diagnostic. |
| Wrong account / authorization failure | Use `wrangler whoami` and reauthenticate in the intended account. Check scoped permissions without sharing token contents. |
| GitHub authentication failure | `gh auth status`, interactive `gh auth login --hostname github.com`, then `gh auth setup-git`; never put tokens in remote URLs. |
| Worker URL works, apex fails | Inspect existing Custom Domain status, DNS delegation, and certificate status. Compare with the current Cloudflare zone; do not replace nameservers or unrelated records blindly. |
| Old content | Compare deployed SHA/version with expected commit; inspect failed builds and concurrent CLI releases, then browser/CDN caching. Do not start by purging everything. |
| Blank page / missing CSS | Check network and console errors, built asset paths, correct `dist`, and Vite base configuration before changing hosting. |
| `www` does not resolve/redirect | Apex success does not establish `www`. Its redirect is proposed work requiring a separate approved DNS/domain change. |

Read-only checks such as `curl -I https://cloudrouzan.com` and
`dig NS cloudrouzan.com` can help isolate HTTP and delegation problems; an HTTP 200 does
not prove the expected content was deployed. Squarespace manages registration/renewal;
Cloudflare DNS manages zone records per the restoration record. Preserve mail records.

## Recovery and rollback
Identify the last known good commit and Cloudflare deployment version before a release.
If a release breaks production, gather the failing SHA/version and logs, and ask the owner
to approve recovery. After approval, use the existing Worker's deployment history to
restore the known good version, or use Wrangler's rollback command with an explicitly
selected version. Verify the domain afterward. Reconcile GitHub with a reviewed revert PR;
a later automatic build may otherwise overwrite the rollback. Do not force-push history,
delete the Worker, or recreate DNS as a rollback strategy.

## References
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Wrangler Worker commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- [Cloudflare rollback guidance](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

Check current official guidance before changing tooling or release settings.
