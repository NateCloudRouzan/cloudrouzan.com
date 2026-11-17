# BarBuddy readiness audit — 2026-11-16

## Scope and result

Audited every catalog recipe against all shared inventory items, stock state,
directional aliases, optional ingredients, equipment and recipe verification flags.
The baseline was 40 ready recipes out of 692, with 7 browse-only recipes needing
verification. There were 94 recipes one required ingredient away with equipment
available. All ingredient-complete baseline recipes also had their required tools.
The baseline 59 inventory entries were products/supplies, not 59 cocktail recipes.
Owner confirmation adds always-available drinking water, bringing this to 60 entries.

After the changes: **50 ready / 699 total**, including **40 with listed
substitutions** (this includes bottled citrus and prepared SodaStream mixers).
There are **112 recipes one ingredient away**, 642 otherwise blocked and 7 needing
recipe verification. These are unfiltered counts; search and preferences can reduce
the website's displayed matching count. No remaining volumes are tracked, so “ready”
means ingredient types and tools are available, not that every batch volume is stocked.

## Corrections and deliberate boundaries

- Triple sec can replace Cointreau with a flavor/strength difference note.
- Scrappy’s aromatic bitters can replace Angostura only in dash/drop quantities.
  Angostura-led recipes such as Trinidad Sour remain blocked; this is not a
  blanket equivalence for 45 ml pours.
- Scrappy’s chocolate bitters can replace Angostura cocoa bitters in dash/drop doses.
- Chambord/raspberry-liqueur IDs, cocktail cherry IDs and still-water IDs now resolve.
  Drinking water was subsequently confirmed always available by the owner.
- Japanese whisky already satisfies generic whiskey requirements. It does not
  silently become bourbon, rye, Irish or smoky Scotch.
- Juice is not whole fruit; cherries are not maraschino liqueur; ginger ale is not
  ginger beer; Aperol is not Campari; still wine is not sparkling wine.
- Ninja SLUSHi is not a blender. A blender recipe needs a separately developed
  machine formulation. No tools or pantry supplies were inferred during this audit.
- Imported optional ingredients do not block readiness. Seven incomplete imported
  methods/quantities remain quarantined. Current ingredient-complete recipes are
  not blocked solely by equipment.

## Newly ready recipes

- Gin Pahit
- Mexican Firing Squad
- Mezcal Margarita
- Pegu Club
- Stork Club
- Tequila Daisy
- Tonic Rickey
- Mission Strawberry Margarita (ready to pour)
- Mission Tamarind Margarita (ready to pour)
- Ninja SLUSHi Margarita (lime-juice version)

Seven are existing recipes unlocked by mapping corrections; two are ready-to-pour
Mission products, and one is the new SLUSHi margarita. The two premixed recipes each require just their matching bottle;
90 ml is a BarBuddy serving suggestion, not a manufacturer transcription. Ice and
rims are optional. Their 25% ABV premix is not an undiluted SLUSHi input.

## Main remaining blockers

Counts below are recipes requiring each item, not the number that one purchase
would immediately unlock. Many recipes need multiple missing ingredients.

| Missing ingredient | Recipes |
| --- | ---: |
| Sweet red vermouth | 70 |
| Campari | 64 |
| Bourbon whiskey | 50 |
| White rum | 46 |
| Rye whiskey | 44 |
| Dry vermouth | 42 |
| Maraschino | 35 |
| St-Germain | 32 |
| Mint | 32 |
| Dark Rum | 32 |
| Coffee liqueur | 31 |
| Grapefruit juice | 31 |
| Honey Syrup | 31 |
| Green Chartreuse | 31 |
| Cynar | 30 |

## Ninja SLUSHi additions

Five measured, attributed recipes were added, with paraphrased methods and source
links. Batch yields and fill-line guidance are explicit. No pictures, promotional
prose or transcripts were copied. No automatic conversion from blender recipes.

| Recipe | Source | Current missing items |
| --- | --- | --- |
| Ninja SLUSHi Margarita (lime-juice version) | [Cooking With Janica · Jessica Pinney](https://cookingwithjanica.com/ninja-slushi-margaritas/) | None |
| Ninja SLUSHi Pineapple Rum | [Ninja Test Kitchen · Pineapple Rum Slushi](https://www.sharkninja.com/pineapple-rum-slushi/REC15542.html) | Spiced rum, Canned full-fat coconut milk |
| Ninja SLUSHi Frozen Mimosa | [Ninja Test Kitchen · Frozen Mimosa Slushi](https://www.sharkninja.com/frozen-mimosa-slushi/REC14443.html) | Prosecco |
| Ninja SLUSHi Coffee Frappé | [Ninja Test Kitchen · Coffee Frappé Slushi](https://www.sharkninja.com/coffee-frappe-slushi/REC14571.html) | Half-and-half, Vanilla Extract, Superfine sugar |
| Ninja SLUSHi Diet Cola Slush | [Ninja Test Kitchen · Sugar Free Diet Soda Slush](https://www.sharkninja.com/sugar-free-diet-soda-slush/REC16377.html) | Liquid allulose |

The margarita uses Janica's explicit fresh-lime replacement for limeade, retaining
its additional syrup and water. It calls for standard 1:1 simple syrup, now confirmed by the owner. Recipe recommendations do not infer
that one lemon/lime yields a cup of juice. Check batch quantities.

Diet Cola Slush requires **liquid allulose** from the official recipe. The diet
SodaStream syrups alone do not satisfy it. The source's FS301 settings are recorded;
use the actual model's manual and fill lines. Added recipes contain no ice/solids.

## Reproduce and validation

Run `node --experimental-strip-types scripts/audit-barbuddy.ts` for a full JSON
report including every recipe's missing ingredients, equipment and substitutions.
The script reads local catalog and shared stock only; it performs no network calls.
Build, TypeScript and the 30-test suite validate catalog references, directional
substitutions, stock propagation, bitters dose restrictions and machine requirements.
The available local runtime is Node v26.13.1 / npm 11.20.0.

Substitution category references: [Scrappy’s aromatic bitters](https://www.scrappysbitters.com/bitters/aromatic-bitters),
[Cointreau triple sec](https://www.cointreau.com/us/en/products/cointreau).
Brand substitutions are BarBuddy decisions based on the product category; flavors
are not claimed identical. Source pages checked 2026-11-16.
