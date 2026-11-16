# BarBuddy

BarBuddy is the cocktail finder at `/BarBuddy` (also supports the trailing slash).
The homepage Projects section links to it. It uses the existing static React/Vite
site, with a separate HTML entry emitted to `dist/BarBuddy/index.html` so direct
loads do not require changing the Worker to use a global SPA fallback.

## First version

- Twenty recipes: sixteen IBA-referenced recipes and four labeled house highballs.
- Ingredient/product inventory with bottle/item quantities and have, low, out, and unknown states.
- Equipment, taste, base-spirit, preparation, style, and ingredient exclusions.
- Make-now results, missing ingredients/tools, and low-stock notices.
- One-ingredient unlocks calculated against the current catalog and settings.
- Restock and discovery shopping list with quantity/size notes and search links.
- Private 1–5 star drink reviews with optional notes, editable from cards or My reviews.
- Versioned browser storage, validated backup import with confirmation, and export.

The product directory is generic content; it does not assert ownership or quantities.
Inventory starts empty. Personalized stock, tools, shopping lists, and reviews stay in the
browser. They are not synchronized across devices or preview/production origins.
Do not commit personalized JSON exports or household photos.

Book recipes and page references are not yet available. The current catalog does
not claim to transcribe *501 Must-Taste Cocktails*. The recipe source links were
read on 2026-11-16; descriptions and methods are written for this interface.
The Moscow Mule uses generic vodka and says so; the Whiskey Sour omits optional
egg white. Garnishes are optional in this catalog. House recipes have no IBA claim.
Ninja SLUSHi equipment can be recorded, but frozen recipes remain unavailable until
model-specific recipes and operating requirements have been verified.

Shopping links open an encoded Google query with the selected retailer's name,
product, and optional size notes. They are not retailer product links, live stock
checks, or direct-cart integrations. Opening one does not update inventory.
“Confirm purchased & add to bar” adds one to the named product quantity, marks it available, and removes
that shopping entry. Exact retailer product links can be added in future work.

## Source map

- `src/barbuddy/catalog.ts`: ingredient categories, generic product directory,
  equipment, recipe requirements, quantities, methods, and source links.
- `src/barbuddy/model.ts`: persistence validation, matching, unlocks, shopping
  deduplication, and search URL creation.
- `src/barbuddy/BarBuddy.tsx`: interface and local storage.
- `src/barbuddy/barbuddy.css`: scoped styling and decorative CSS glass illustrations.
- `BarBuddy/index.html`: route-specific shell and metadata.
- `tests/barbuddy.test.ts`: focused pure-logic checks.

Extend the catalog by adding stable IDs and explicit requirements. Different
bitters, premixes, and flavored ingredients stay separate. Do not map Japanese
whisky to bourbon, or amber curaçao to triple sec, without an explicit recipe
variant. Profile version 2 adds whole-number quantities (0–9999); version-1 browser saves
and backups are migrated automatically using the existing storage key. Each legacy
row counts as one item (out rows count as zero); matching product/category names
are combined with summed quantities. Different brands remain separate. Users can
correct counts if duplicate rows were accidental. Zero quantity is unavailable.
Owned directory products stay hidden even when out; use inventory/restock controls
or remove the row to make its add option return. Generic ingredient categories are
hidden when a product already represents them; other brands remain addable.
Adding categories may require a deliberate persistence migration; imports reject
IDs that the current catalog does not recognize.

## Validation

Use the repository [setup instructions](SETUP.md), plus:

```sh
node --experimental-strip-types --test tests/barbuddy.test.ts
```

The focused checks cover availability, equipment blockers, exclusions, ingredient
specificity, unlock deduplication, import validation, shopping deduplication, and
URL encoding. Use a supported Node release with built-in TypeScript stripping.

Initial local validation: Node v26.13.1, npm 11.20.0, Vite 6.4.6. Build, TypeScript,
and seven checks passed. Browser checks exercised inventory, one-ingredient unlocks,
purchase confirmation, reload persistence, and low-stock notices. At a 390-pixel
viewport the page had no horizontal document overflow; the console had no warnings
or errors during these checks. Repeat relevant checks when behavior changes.

## Drink reviews

Profile version 3 adds one review per supported cocktail: stable drink ID, an integer
rating from 1 to 5, an optional plain-text note of up to 2000 characters, and a last
updated timestamp. Version-1 and version-2 saves/backups migrate with an empty review
list while retaining inventory, equipment, quantities, and shopping. The original
storage key is retained so existing browser data is found.

Use Review this drink on a card or choose any catalog drink in My reviews. Saving
an edit replaces that cocktail's previous review; this is not a per-serving history.
Reviews appear newest first and can be edited or removed. Notes render as text with
line breaks preserved. They stay local and are included in exports and confirmed
replacement imports. Ratings do not change recommendation ranking in this version.
`ReviewEditor.tsx` owns the rating/note form; `model.ts` validates and saves reviews.

Review validation adds checks for save/edit behavior, round-trip persistence,
legacy migration, invalid stars, notes, dates, drink IDs, and duplicate reviews.
