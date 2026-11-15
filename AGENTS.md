# Codex instructions for cloudrouzan.com

## Purpose and scope
Personal website for Nate Cloud-Rouzan: projects, experiments, and technical writing.
Keep the React + TypeScript + Vite static-site architecture simple. Make focused,
incremental changes and preserve the existing design unless the task requests a change.
Do not add a backend, framework, or dependency without a concrete need.

## Read first
- [Setup](docs/SETUP.md): installation and local validation.
- [Architecture](docs/ARCHITECTURE.md): source map and hosting boundaries.
- [Deployment](docs/DEPLOYMENT.md): release procedures and troubleshooting.
- [Learnings](docs/LEARNINGS.md): restoration history and evidence limits.
- [Roadmap](docs/ROADMAP.md): proposed work, not automatic authorization.

## Work safely
1. Inspect Git status, relevant files, and these docs before editing. Preserve unrelated work.
2. Create a feature branch from the current intended base; never work directly on `main`.
3. Keep changes within the requested scope. For documentation tasks, leave application,
   package, lockfile, and hosting configuration files unchanged.
4. Never commit credentials, tokens, personal account exports, `.env` files, or generated
   `dist/`, `node_modules/`, and Wrangler state. Inspect staged files explicitly.
   `VITE_*` values are public browser data, never secrets.
5. Preserve `wrangler.jsonc` Worker name `cloudrouzan`, compatibility date, and asset path
   unless an infrastructure change is explicitly requested. Do not change DNS, nameservers,
   registrar, custom domains, billing, or unrelated mail records as part of code changes.
6. Squarespace remains the registrar; Cloudflare provides DNS and Workers hosting per the
   restoration record. Do not migrate services implicitly.
7. Do not merge or deploy without the owner's explicit approval. A merge/push to `main`
   can trigger production deployment through Cloudflare Workers Builds. Do not run
   `wrangler deploy`, `versions upload`, rollback, or preview publishing as validation.
8. Before pushing a feature branch, check whether branch builds publish previews. If this
   cannot be verified and deployment is forbidden, keep the branch local and prepare the
   PR text until the owner confirms safe branch publishing.
9. Use pull requests for review; do not enable auto-merge. Report validation results and
   limitations, and update relevant docs when commands or architecture change.

## Commands and validation
There is currently no committed lockfile or pinned Node/Wrangler version.
Use a supported Node LTS release and npm; record versions used.

```sh
npm install --package-lock=false
npm run build
npx --no-install tsc --noEmit
```

`npm ci` only works after a lockfile has been deliberately added and reviewed.
`npm run build` runs Vite, not the TypeScript checker. No lint or automated test scripts
exist. For UI changes, also run `npm run dev` or `npm run preview`, inspect desktop and
mobile layouts, links, and browser console. For docs-only changes, check links, commands,
`git diff --check`, and verify that only the intended Markdown files changed. Do not add
trivial tests just for documentation. Never deploy to prove a build works.

## Repository map
`src/main.tsx` contains the whole React app; `src/styles.css` controls styling.
`index.html` owns the document shell and metadata. `vite.config.ts` uses the React plugin.
`wrangler.jsonc` serves Vite's `dist/` assets without a custom Worker script.
