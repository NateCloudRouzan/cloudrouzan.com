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
SLUSHi, strainer, and stirring spoon are confirmed. Ice is recorded as one Freezer
availability entry, bringing the inventory to 53 entries. A strainer alone does not
confirm a shaker or mixing glass.

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

### Prepared SodaStream mixers

The owner confirms sparkling water can always be made; it is recorded as an
available Cabinet supply. Stocked tonic, diet cola, diet ginger ale, and diet
lemon-lime concentrates supply their prepared mixers when the Aarke carbonator
is available. Diet cola can satisfy cola/Coke Zero requirements by owner request.
Ginger ale does not supply ginger beer; flavored concentrates do not supply fruit
juices. Low-stock warnings propagate from concentrates to their prepared mixers.
Out, unknown, and zero-quantity concentrates supply no prepared soda.

### Ingredient matching and substitutions

Specific whisky styles satisfy generic Whiskey, but not other specific styles.
Japanese whisky therefore matches Whiskey and Japanese Whiskey, not bourbon or rye.
Bottled lime/lemon/orange juices satisfy the corresponding fresh-juice requirements;
recipe instructions show the actual stocked product and “Fresh is preferred.”
This does not satisfy whole-fruit requirements. Blanco/reposado satisfy generic
tequila; dry/amber curaçao share the corresponding imported category names;
aromatic bitters satisfy generic bitters. Portland Pomegranate Cherry can satisfy
grenadine, as its vendor explicitly recommends. These are directional mappings.
Recipe method notes disclose matches through the “Using your bar” section.
Quantity and stock status still apply; low-stock warnings propagate through mappings.

## Vendor and creator recipe additions (2026-11-16)

`data/vendor-recipes.json` adds 21 measured recipes or explicitly attributed
BarBuddy adaptations, bringing the catalog to 688. All have source links, checked
dates, ingredients, method and tool requirements. No external photos or descriptive
prose were imported. The existing Japanese Whisky Highball gains its verified
Suntory reference without changing its ID. Named vendor variants are kept distinct
where their proportions differ from existing recipes. Reviews retain their IDs.

SodaStream Shirley Temple and Dirty Shirley are separate alcohol-free/alcoholic
records. Pitcher recipes clearly state batch yields. Prepared syrups are separate
ingredients with preparation instructions; they do not imply sugar or other supplies
are stocked. New recipes use the existing substitution and missing-item checks.

`data/discovery-links.json` exposes 12 additional source leads under Find a drink.
Incomplete recipes and product-use references do not enter recommendation or unlock
counts. The stale Aperix recipe link was excluded after its destination showed
unrelated content. The linked research report preserves unresolved products and gaps.

## Book index and capture list

The Book index tab transcribes 500 named entries from the four supplied index
photos. It links 62 entries to existing same-name reference recipes, flags 9
related/incomplete variants, and lists 429 without a matching recipe. No index
entry is presented as a verified book transcription. The book title's 501 count
has not been reconciled; the UI explicitly reports 500 recovered entries.

`data/book-index.json` retains names, listed pages, photo number, stable IDs,
reference IDs and notes. `BookIndex.tsx` provides name/page search, status filters,
30-entry pagination, recipe navigation and filtered CSV downloads. The durable
capture list is [BARBUDDY-BOOK-CHECKLIST.md](BARBUDDY-BOOK-CHECKLIST.md).

Four verified reference recipes (Tom Collins, Rob Roy, Black Velvet and El Diablo)
are added in `data/book-reference-recipes.json`, with source links and paraphrased
methods. The overall catalog now contains 692 recipes. Existing IDs and reviews
are unchanged. Related names (for example Corpse Reviver versus No. 2, and Mint
Julep I versus II) remain on the capture list. A Clover Club record exists but needs
verification, so it is not counted as an available reference.

One whole fresh lemon and one whole fresh lime were owner-confirmed in the same
session. They are recorded with unspecified storage location, bringing inventory
to 56 entries. Whole fruit can supply its corresponding juice, and is preferred
over bottled juice in preparation notes; no juice volume is inferred.

The owner also confirmed a shaker. Shared equipment now includes the shaker and
the previously recorded strainer; shake recipes use the existing equipment check.

## Cocktail video links

`data/video-links.json` adds four curated direct YouTube links to Margarita, Gin &
Tonic, Batanga and Shirley Temple. The Margarita, Batanga and Shirley Temple links
were confirmed in the Shorts player; the Gin & Tonic guide is a 58-second regular
YouTube video. All four pages and creator credits were checked on 2026-11-16.
Cards show the creator, format, purpose and recipe-variation note. No video, thumbnail,
or transcript is copied or embedded; playback starts only on YouTube after clicking.
Links attach to explicit recipe IDs, not all similarly named variants. Recipe data,
inventory matching and review IDs remain unchanged. Availability may change later.

## Additional owner-confirmed supplies

Simple syrup, Aperol and pineapple juice are available, with package count, storage
location and remaining volume unspecified (one availability entry each). Inventory
now contains 59 entries. Aperol remains separate from the photographed Aperix.
Pineapple juice satisfies fresh pineapple juice requirements with a fresh-preferred
note; it does not imply whole pineapple is stocked. The mixing glass is confirmed
and the existing strainer remains recorded once.

## Inventory categories

The bar now groups its inventory into spirits, liqueurs/aperitifs, juices, syrups,
bitters/tinctures, mixers/concentrates, wine/beer, ready-to-drink cocktails, coffee/tea,
fruit/garnishes/rims and flavorings/extras. Category and location filters work
together; cards retain location, quantity, stock status and restock links. Groups
show entry counts, omit empty sections and sort products by name. Equipment remains
separate. Display categories do not alter ingredient matching or saved inventory.

## Readiness audit and machine recipes

See [BARBUDDY-READINESS-AUDIT.md](BARBUDDY-READINESS-AUDIT.md) for the all-catalog
audit, baseline, mapping corrections, remaining blockers and sources. The catalog
now contains 699 entries: seven additions are two one-item ready-to-pour Mission
serves and five sourced Ninja SLUSHi recipes. Ready cards identify substitutions,
and the UI explains ingredient-type versus batch-volume availability. Frozen
results no longer imply that all frozen recipes require a blender.

`serves-and-slushi.json` keeps measured recipe needs, yields, source attribution,
model guidance and optional garnishes separate from inventory. The diet-cola
recipe requires liquid allulose. Branded aromatic/cocoa bitters substitutions are
restricted to dash/drop doses; large bitters-base pours retain their requirements.
`node --experimental-strip-types scripts/audit-barbuddy.ts` emits a full audit.

The owner confirmed always-available drinking water and standard 1:1 simple syrup.
Water is now one availability entry (60 inventory entries total), and the audit
now finds 50 ready recipes / 699 total and 112 one ingredient away.

## More cocktail videos and video-only browsing

Eight additional direct YouTube videos cover French Martini, Negroni, Aperol Spritz,
Paloma, Cosmopolitan, Tequila Sunrise, Daiquiri and Espresso Martini. This brings
coverage to 12 explicitly linked recipe IDs. Five additions open in the Shorts
player; Spritz and Paloma are 46/58-second regular videos, and Cosmopolitan opens
as a regular video. All destinations/titles were checked on 2026-11-16. Creator
credits and recipe differences are shown; the espresso clip is explicitly labeled
a mezcal/amaro variant, not the catalog's classic vodka recipe. No media is embedded.

Find a drink has an “Only drinks with videos” checkbox that intersects search and
existing preferences before pagination and suggestions. It opens the browse list
and resets pagination. Reset preferences clears it; book recipe navigation also
clears it so an explicit book selection cannot be hidden. It does not restrict
other tabs or change stock, reviews or recipe readiness.

A second readiness audit (2026-11-17) confirms 50 ready / 699 recipes and 60
inventory entries. The full missing-ingredient histogram, base-tag counts, tool
checks and simulated immediate unlocks are in BARBUDDY-READINESS-AUDIT.md. Georgia
Peach syrup now satisfies generic peach syrup (not peach fruit/liqueur/plain syrup),
raising one-ingredient-away entries to 114 while ready remains 50.

On 2026-11-17 the owner confirmed a muddler and blender. Both are now in shared
equipment alongside the Ninja SLUSHi; ordinary blender recipes retain their own
requirements. No additional ingredient was inferred from equipment ownership.
