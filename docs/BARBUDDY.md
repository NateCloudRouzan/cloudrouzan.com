# BarBuddy

BarBuddy lives at `/BarBuddy` and is linked from Projects. It uses the existing
React/TypeScript/Vite static site and Cloudflare Worker. No paid recipe service,
new dependency, account system, or backend is required.

## Catalog and provenance

There are 667 catalog entries: the original 20 recipes plus 647 imported from
[Bar Assistant public data](https://github.com/bar-assistant/data). The source
snapshot contains 663 recipes; 16 overlaps were skipped to preserve existing
BarBuddy recipe IDs, proportions, and saved reviews. This is an expanded catalog,
not a claim to reproduce the exact 501 recipes in Nate's book.

Pinned upstream commit: `5a504d474614494119882eb91a8ffdc5491a483f`.
The upstream MIT notice is retained at
[`public/barbuddy/BAR-ASSISTANT-LICENSE.txt`](../public/barbuddy/BAR-ASSISTANT-LICENSE.txt).
Each imported entry links to its pinned source JSON and preserves its original
source reference. Long narrative descriptions and all upstream images are excluded.

[`import-report.json`](../src/barbuddy/data/import-report.json) records totals,
skipped overlaps, and seven recipes needing verification: three missing method
classifications and four with zero upper-bound measurements. They remain browsable
with a verification badge but do not participate in make-now or unlock results.
The importer validates records; it is not a claim that every recipe has been mixed
or reviewed by a bartender.

Ingredient IDs use reviewed exact equivalences only. Unknown categories are added
with `ba-` IDs, without fuzzy substitutions. Specific spirits remain specific:
blanco tequila, generic agave tequila, and reposado are not automatically equivalent.
Optional ingredients and garnishes are shown separately from requirements. Duplicate
requirements for the same ingredient are grouped without losing their amounts.
Numeric measures retain upstream units; no machine formulation is inferred.

Blend/frozen recipes require a blender. They are not Ninja SLUSHi recipes. Unsupported
methods and unresolved data stay out of recommendations. Original IBA references
and house recipes retain their original IDs and attribution.

### Reproducing the import

```sh
python3 scripts/import-bar-assistant.py --fetch
```

This uses Python's standard library to fetch only pinned recipe JSON and the MIT
license. Each recipe is checked against its Git blob SHA. No upstream code is
executed and no upstream photo collection is downloaded. Temporary source files
live under `/tmp/barbuddy-bar-assistant/<commit>/`; exclude them from Git.
Running without `--fetch` normalizes an existing cache into the checked-in data.
Inspect the generated diff and import report before releasing updated data.

`ingredients.json` and `recipes-a.json` / `recipes-b.json` are generated source
artifacts. The two recipe chunks avoid one large application bundle. React lazy
loading keeps the BarBuddy catalog off the homepage's initial load. The separate
`BarBuddy/index.html` entry supports direct visits without a Worker routing change.

### Photos

One individually verified photo is included: *Klassiche Margarita*, Cocktailmarler,
[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Klassiche_Margarita.jpg),
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
The stored thumbnail is resized; the UI displays it cropped and links its author,
source, and license. Remaining cards use decorative CSS illustrations. Credits in
Bar Assistant's photo metadata are not treated as blanket reuse permission.

## Shared inventory

All visitors use the same published bar, defined in
[`shared-bar.json`](../src/barbuddy/data/shared-bar.json). The initial inventory was
recorded on 2026-11-16: 15 fridge containers, 13 pantry containers, 4 cabinet supply
entries, and 20 bar cart entries (including owner-confirmed Tajín). Overlapping
photos count once. Cabinet supplies and Tajín use quantity 1 as an availability
entry, not a confirmed package count. Remaining volume and low-stock status are
not inferred. Tallax wine style remains unconfirmed. Aarke carbonator and Ninja
SLUSHi are confirmed; other equipment is not assumed.

Bottled juices, concentrates, flavored syrups, tinctures, and premixed drinks retain
specific categories. Aperix is not automatically substituted for Aperol; Goldschläger
is separate from Fireball; dehydrated lemons are garnish, not fresh juice.

Update this file through the normal code review and release workflow when Nate
provides inventory changes. Each item has a stable ID, ingredient ID, display name,
whole-number bottle/item quantity (0–9999), and availability (`have`, `low`, `out`,
`unknown`), with optional location and product notes. Equipment uses IDs from `catalog.ts`. Update the date and status message.
The snapshot is validated using the same inventory validator as personal backups.
No visitor-facing inventory writes or public update endpoint exist.

`withSharedBar` overlays the published inventory/equipment for all matching and
unlock calculations. Visitor browser data cannot override the published snapshot.
Existing private inventory and tools remain in personal storage and exports, so
switching to the shared bar does not erase previous entries. Importing a personal
backup changes only that browser's personal data, not the shared inventory.

## Shopping and retailer comparison

Links now go directly to retailer search pages at Total Wine, BevMo, Instacart,
and Amazon. Queries are URL-encoded and destinations come from a fixed allowlist.
They are search links, not guaranteed product pages, external cart mutations, or
claims of current stock. Product-specific URLs can be introduced when brands,
package sizes, and store regions are confirmed in the inventory session.

Each shopping entry can store the visitor's own available/unavailable check for
any retailer, with a timestamp. The comparison summary says all items are available
only when the visitor has explicitly marked every entry available at that retailer.
It labels this as “marked available by you,” not live stock. Unknown, unavailable,
and an empty list never qualify as all-confirmed. Real-time automatic availability
requires a separately verified retailer integration and appropriate location context.

Shopping lists and retailer checks remain private to each browser and are included
in personal backups. Mark purchased removes an entry from the personal list; it
never updates the shared bar. Nate can tell Codex about confirmed purchases in chat.

## Personal reviews and backups

Profile version 3 keeps one editable review per catalog drink: stable drink ID,
1–5 integer stars, optional plain-text note up to 2000 characters, and updated date.
Reviews stay in the browser and do not change recommendation ranking. Version-1/2
saves migrate without losing inventory, equipment, quantities, or shopping. The
original storage key is retained to find existing saves. Optional retailer checks
are a backward-compatible extension to shopping entries.

Exports include personal inventory, tools, shopping, retailer checks, and reviews.
Imports are validated and require confirmation before replacement. They do not
publish data. Storage is per browser/origin and is not cross-device synchronization.
Never commit personal exports, household photos, credentials, or private notes.

## Source map and validation

- `catalog.ts`: original recipes, generated catalog composition, equipment, image metadata.
- `model.ts`: profile validation, matching, quarantine, unlocks, personal shopping/reviews.
- `shared-bar.ts`: validated published snapshot and recommendation overlay.
- `retailers.ts`: direct search URL construction and supported retailers.
- `BarBuddy.tsx` / `ReviewEditor.tsx`: public shared bar and private visitor interfaces.
- `tests/barbuddy.test.ts`: meaningful matching, migration, catalog and shopping checks.

Follow [SETUP.md](SETUP.md), and run:

```sh
node --experimental-strip-types --test tests/barbuddy.test.ts
```

Development uses Node v26.13.1 and npm 11.20.0. Build, TypeScript, focused checks,
source/license integrity, desktop/mobile layouts, direct routes, review persistence,
private/shared data boundaries, image credits, and retailer link destinations must
be verified for this release. Do not change DNS, registrar, billing, or Worker identity.
The original personal design draft remains local and is excluded from publication.
