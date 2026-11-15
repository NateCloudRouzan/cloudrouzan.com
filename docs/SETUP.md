# Local development setup

## Prerequisites
Install Git, a supported Node.js LTS release, and npm. GitHub CLI (`gh`) is useful for
private repository access and pull requests. No Node version is pinned in this repository;
choose and record one supported by the installed Vite and Wrangler releases. Cloudflare
credentials are unnecessary for local editing and builds.

```sh
git clone https://github.com/NateCloudRouzan/cloudrouzan.com.git
cd cloudrouzan.com
git switch -c feature/describe-your-change
node --version
npm --version
npm install --package-lock=false
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`); stop with Ctrl+C.
There is no committed `package-lock.json`, so `npm ci` fails on a fresh checkout.
The install command above avoids generating a lockfile for a documentation-only task.
Dependency ranges can resolve differently across installs. Adding a reviewed lockfile and
pinning tool versions is planned in [ROADMAP.md](ROADMAP.md); once a lockfile exists,
use `npm ci` for reproducible installs. Do not casually update dependencies alongside
unrelated website changes.

## Validate and preview

```sh
npm run build
npx --no-install tsc --noEmit
npm run preview
```

Build output is `dist/`. Open the preview URL printed by Vite (normally
`http://localhost:4173`). Preview serves the built files locally; it does not publish them.
Vite's build does not run TypeScript type checking, so run the separate checker above.
There are no lint or test scripts. For UI edits, check narrow and wide screens, keyboard
navigation, external links, and the browser console. Commit neither dependencies nor build
output. For documentation edits, also run `git diff --check` and inspect local links.

## Working with Codex remotely
Give the environment repository access and dependency-install network access, then have it
read [AGENTS.md](../AGENTS.md). Use the same install/build/type-check commands as locally.
No production Cloudflare token is needed. Keep changes on a feature branch, review the
file diff, and prepare a PR. Before publishing a branch, verify Cloudflare's branch build
settings as described in [DEPLOYMENT.md](DEPLOYMENT.md). A successful build is not
permission to merge or deploy.

## Common local issues
- Authentication: use `gh auth status`; if needed, sign in interactively with
  `gh auth login --hostname github.com`, then `gh auth setup-git`. Never paste tokens into
  documentation, command history, or a PR.
- Missing packages: run the install command from the directory containing `package.json`.
- Node/tool incompatibility: compare `node --version` with the installed tool's supported
  versions; use a supported LTS release before changing dependencies.
- Port occupied: open Vite's actual printed URL or choose `npm run dev -- --port 5174`.
- Blank page: inspect the console and build errors; confirm `index.html` loads
  `/src/main.tsx` in development and that the `root` element still exists.

Start with [ARCHITECTURE.md](ARCHITECTURE.md) for the source layout and
[DEPLOYMENT.md](DEPLOYMENT.md) for hosting issues.
