# Architecture

## Current design
A static personal homepage implemented in React 19 and TypeScript, bundled by Vite 6
(version ranges in `package.json`). There is no backend, database, API, router, or custom
Worker script in the repository. The browser renders the application after loading the
HTML shell and compiled assets.

```text
Source on GitHub -> Vite build -> dist/ -> Cloudflare Worker static assets -> browser
                                      cloudrouzan.com Custom Domain
Squarespace registration -> Cloudflare authoritative DNS (restoration record)
```

## Files and responsibilities
| Path | Responsibility |
| --- | --- |
| `index.html` | HTML shell, language, viewport, description, title, and React mount element |
| `src/main.tsx` | React entry point and inline App: introduction, profile links, Projects placeholder, footer |
| `src/styles.css` | Global styles and layout |
| `vite.config.ts` | Vite configuration with React plugin |
| `tsconfig.json` | Strict TypeScript settings; no emitted files |
| `package.json` | Dependencies and dev/build/preview commands |
| `wrangler.jsonc` | Worker `cloudrouzan`, compatibility date `2026-11-10`, assets directory `./dist` |
| `docs/` and `AGENTS.md` | Development, operations, history, and agent guidance |

The GitHub link points to NateCloudRouzan; LinkedIn points to the owner's profile at
`https://www.linkedin.com/in/cloudrouzan`. Projects are intentionally a placeholder. The footer computes the current year
in the browser. Documentation work must not alter any of this behavior.

## Hosting boundaries
- GitHub stores source and review history. The earlier restoration chat reports that
  `main` is connected to automatic Cloudflare Workers Builds.
- Cloudflare Workers serves static files from `dist/`. The configured compatibility date
  is a runtime behavior setting, not a deployment timestamp; do not bump it casually.
- Cloudflare DNS and the apex Worker Custom Domain were established during restoration.
- Squarespace remains the domain registrar, including registration renewal. Hosting a
  site elsewhere does not require transferring registration.

There are no GitHub Actions workflows in this snapshot. Cloudflare build settings,
branch filters, account identifiers, DNS records, and domain bindings are not declared
here and were not independently audited in the account. See [LEARNINGS.md](LEARNINGS.md)
for the distinction between repository evidence and restoration history.
The starter README's suggestions of Pages or Vercel are generic; the restored deployment
uses Workers. Do not create a second hosting project from that example.

## Future changes
Keep content and styling changes small. Extract components when useful, and introduce
routing or server functionality only for an agreed feature. Client environment variables
are public; do not embed private credentials in Vite bundles. Adding routes requires
checking direct URL loads and refresh behavior on Workers, not just Vite navigation.
See [ROADMAP.md](ROADMAP.md) for proposed milestones.
