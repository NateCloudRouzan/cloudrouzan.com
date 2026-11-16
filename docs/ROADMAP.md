# Roadmap

These are proposed follow-up tasks, not permission to implement, merge, or deploy them.
Keep each change small enough to validate and understand. Current website behavior is preserved
by the documentation work.

## 1. Make development repeatable
- Add and review `package-lock.json`, then use `npm ci` locally and in builds.
- Select a supported Node LTS version and pin/document it for local and hosted builds.
- Pin Wrangler as a development dependency and agree on a version update policy.
- Add a type-check script and minimal build/type-check PR checks that do not deploy.
- Confirm branch protection, required checks, Cloudflare production branch, and preview
  publishing rules. Record the verified settings without exporting secrets.

Done when a fresh checkout uses repeatable installs, passes build/type checking, and
can open a PR without publishing anything unintentionally.

## 2. Verify restored operations
- Review the existing Workers Builds repository connection, commands, deployed SHA,
  Custom Domain, DNS delegation, and certificate status with the owner.
- Confirm Squarespace renewal remains active; preserve unrelated DNS and mail records.
- Record a known good deployment and recovery procedure.
- Plan and approve an explicit `www.cloudrouzan.com` -> apex redirect if desired.
- Align the generic starter README with the Workers-specific documentation in a separate
  change, keeping application files unchanged.

Done when the owner can explain which action publishes production and can recover a
known good version without guessing or recreating infrastructure.

## 3. Improve the portfolio incrementally
- Replace the generic LinkedIn destination after the owner supplies the actual URL.
- Add real project descriptions and links to the existing Projects section.
- Check accessibility, keyboard focus, responsive layout, and metadata as content grows.
- Add technical writing and interactive demonstrations when content is ready.

Done per feature when the agreed content is present, links and layouts work, and local
validation passes. Add routing, a backend, Go services, or new dependencies only when an
agreed feature justifies them; none are required for the current static homepage.

## 4. Exercise the remote workflow
Use [AGENTS.md](../AGENTS.md) and [SETUP.md](SETUP.md) for a small approved Codex task.
Use a feature branch, local validation, and a clear PR for history. Another reviewer and
a separate routine release approval are not required. Keep unfinished PRs open, then merge
completed work to deploy. Use the standing authorization and infrastructure boundaries in
[DEPLOYMENT.md](DEPLOYMENT.md). Supply no production credentials for editing tasks.
