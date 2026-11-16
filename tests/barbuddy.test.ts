import { withSharedBar, sharedBar } from "../src/barbuddy/shared-bar.ts";
import { retailers } from "../src/barbuddy/retailers.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { drinks, ingredients } from "../src/barbuddy/catalog.ts";
import {
  emptyProfile,
  defaultPreferences,
  inspect,
  unlocks,
  matches,
  parseProfile,
  addShopping,
  searchURL,
  addInventory,
  isInInventory,
  setQuantity,
  saveReview,
  checkRetailer,
  retailerSummary,
} from "../src/barbuddy/model.ts";
const drink = (id: string) => drinks.find((d) => d.id === id)!;
test("low counts as available; out/unknown do not; duplicate bottles do not hide low correctly", () => {
  const p = emptyProfile();
  p.items = [
    { id: "v", ingredient: "vodka", name: "Vodka", quantity: 1, stock: "low" },
    { id: "s", ingredient: "soda", name: "Water", quantity: 0, stock: "out" },
    { id: "i", ingredient: "ice", name: "Ice", quantity: 1, stock: "unknown" },
  ];
  assert.deepEqual(
    inspect(drink("vodka-soda"), p).missing.map((n) => n.id),
    ["soda", "ice"],
  );
  assert.equal(inspect(drink("vodka-soda"), p).low.length, 1);
  p.items.push({
    id: "v2",
    ingredient: "vodka",
    name: "Another vodka",
    quantity: 1,
    stock: "have",
  });
  assert.equal(inspect(drink("vodka-soda"), p).low.length, 0);
});
test("unlocks only count a sole missing ingredient when equipment is present", () => {
  const p = emptyProfile();
  p.tools = ["spoon"];
  p.items = ["vodka", "gin", "japanese-whisky", "ice"].map((id) => ({
    id,
    ingredient: id,
    name: id,
    quantity: 1,
    stock: "have" as const,
  }));
  const soda = unlocks(p, defaultPreferences()).find((u) => u.id === "soda")!;
  assert.ok(
    ["gin-soda", "vodka-soda", "whisky-highball"].every((id) =>
      soda.drinks.some((d) => d.id === id),
    ),
  );
  assert.equal(new Set(soda.drinks.map((d) => d.id)).size, soda.drinks.length);
  p.tools = [];
  assert.equal(
    unlocks(p, defaultPreferences()).find((u) => u.id === "soda"),
    undefined,
  );
});
test("exclusions apply to recommendations and unlocks", () => {
  const prefs = { ...defaultPreferences(), avoid: ["soda"] };
  assert.equal(matches(drink("vodka-soda"), prefs), false);
  const p = emptyProfile();
  p.tools = ["spoon"];
  p.items = ["vodka", "ice"].map((id) => ({
    id,
    ingredient: id,
    name: id,
    quantity: 1,
    stock: "have" as const,
  }));
  assert.equal(
    unlocks(p, prefs).some((u) => u.id === "soda"),
    false,
  );
});
test("flavored mixers, Japanese whisky and amber curaçao are not universal substitutes", () => {
  const p = emptyProfile();
  p.items = ["peach-ginger", "japanese-whisky", "amber-curacao"].map((id) => ({
    id,
    ingredient: id,
    name: id,
    quantity: 1,
    stock: "have" as const,
  }));
  assert.ok(
    inspect(drink("margarita"), p).missing.some((n) => n.id === "triple-sec"),
  );
  assert.ok(
    inspect(drink("old-fashioned"), p).missing.some((n) => n.id === "bourbon"),
  );
  assert.ok(inspect(drink("gin-fizz"), p).missing.some((n) => n.id === "soda"));
});
test("imports reject unknown IDs, unsupported versions and duplicates; round-trip is lossless", () => {
  const p = emptyProfile();
  assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(p))), p);
  assert.throws(() => parseProfile({ ...p, version: 4 }));
  assert.throws(() => parseProfile({ ...p, tools: ["unknown"] }));
  const i = {
    id: "x",
    ingredient: "vodka",
    name: "Vodka",
    quantity: 1,
    stock: "have",
  };
  assert.throws(() => parseProfile({ ...p, items: [i, i] }));
});
test("shopping merges reasons, keeps exact products separate, and search queries are encoded", () => {
  let p = addShopping(emptyProfile(), "gin", "Gin & citrus", "Restock");
  p = addShopping(p, "gin", "Gin & citrus", "For a drink");
  assert.equal(p.shopping.length, 1);
  assert.equal(p.shopping[0].reasons.length, 2);
  p = addShopping(p, "gin", "Another brand", "Restock");
  assert.equal(p.shopping.length, 2);
  const u = new URL(searchURL("Gin & citrus"));
  assert.equal(u.hostname, "www.totalwine.com");
  assert.equal(u.searchParams.get("text"), "Gin & citrus");
});
test("catalog has unique IDs and all references are recognized", () => {
  assert.equal(new Set(drinks.map((d) => d.id)).size, drinks.length);
  for (const d of drinks) {
    assert.doesNotThrow(() =>
      parseProfile({
        ...emptyProfile(),
        tools: d.tools,
        items: d.needs.map((n) => ({
          id: n.id,
          ingredient: n.id,
          name: n.id,
          quantity: 1,
          stock: "have",
        })),
      }),
    );
  }
});

test("legacy saves combine duplicate products and preserve different brands", () => {
  const p = parseProfile({
    version: 1,
    items: [
      { id: "1", ingredient: "gin", name: "Gin", stock: "have" },
      { id: "2", ingredient: "gin", name: " gin ", stock: "low" },
      { id: "3", ingredient: "gin", name: "Other brand", stock: "have" },
    ],
    tools: ["spoon"],
    shopping: [],
  });
  assert.equal(p.version, 3);
  assert.equal(p.items.length, 2);
  assert.equal(p.items[0].quantity, 2);
  assert.equal(p.items[0].stock, "have");
  assert.deepEqual(parseProfile(p), p);
});
test("repeated additions increment quantity and directory hides owned products and generic categories", () => {
  let p = addInventory(emptyProfile(), "gin", "Brand gin", "one");
  p = addInventory(p, "gin", " BRAND GIN ", "two");
  assert.equal(p.items.length, 1);
  assert.equal(p.items[0].quantity, 2);
  assert.ok(isInInventory(p, "gin", "Brand gin"));
  assert.ok(isInInventory(p, "gin", "Gin"));
  assert.equal(isInInventory(p, "gin", "Other brand"), false);
  p.items[0] = setQuantity(p.items[0], 0);
  assert.equal(p.items[0].stock, "out");
  assert.ok(isInInventory(p, "gin", "Brand gin"));
  assert.equal(
    inspect(drink("gin-soda"), p).missing.some((n) => n.id === "gin"),
    true,
  );
  p.items[0] = setQuantity(p.items[0], 3);
  assert.equal(p.items[0].stock, "have");
  assert.equal(p.items[0].quantity, 3);
});
test("quantity imports reject invalid values and keep tools and shopping through migration", () => {
  const p = addInventory(emptyProfile(), "vodka", "Vodka", "v");
  for (const q of [-1, 1.5, null, 10000])
    assert.throws(() =>
      parseProfile({ ...p, items: [{ ...p.items[0], quantity: q }] }),
    );
  const legacy = {
    version: 1,
    items: [{ id: "v", ingredient: "vodka", name: "Vodka", stock: "out" }],
    tools: ["spoon"],
    shopping: [
      {
        ingredient: "vodka",
        name: "Vodka",
        reasons: ["Restock"],
        note: "750 ml",
      },
    ],
  };
  const migrated = parseProfile(legacy);
  assert.equal(migrated.items[0].quantity, 0);
  assert.deepEqual(migrated.shopping, legacy.shopping);
  assert.deepEqual(migrated.tools, legacy.tools);
});

test("ratings and notes save, edit without duplication, and survive export/import", () => {
  const review = {
    drinkId: "negroni",
    rating: 5,
    note: "  Try a larger ice cube next time.\nLoved the bitterness.  ",
    updatedAt: "2026-11-16T20:00:00.000Z",
  };
  let p = saveReview(emptyProfile(), review);
  assert.equal(
    p.reviews[0].note,
    "Try a larger ice cube next time.\nLoved the bitterness.",
  );
  p = saveReview(p, { ...review, rating: 4, note: "" });
  assert.equal(p.reviews.length, 1);
  assert.equal(p.reviews[0].rating, 4);
  assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(p))), p);
});
test("old inventories migrate with empty reviews and retain quantities and shopping", () => {
  const p = addShopping(
    addInventory(emptyProfile(), "gin", "Gin", "g"),
    "gin",
    "Gin",
    "Restock",
  );
  const { reviews, ...legacy } = p;
  const migrated = parseProfile({ ...legacy, version: 2 });
  assert.deepEqual(migrated.reviews, []);
  assert.deepEqual(migrated.items, p.items);
  assert.deepEqual(migrated.shopping, p.shopping);
});
test("review validation rejects invalid stars, oversized notes, dates, IDs and duplicate entries", () => {
  const r = {
    drinkId: "negroni",
    rating: 3,
    note: "",
    updatedAt: "2026-11-16T20:00:00.000Z",
  };
  for (const rating of [0, 6, 1.5, NaN])
    assert.throws(() => saveReview(emptyProfile(), { ...r, rating }));
  assert.throws(() =>
    saveReview(emptyProfile(), { ...r, note: "x".repeat(2001) }),
  );
  assert.throws(() =>
    saveReview(emptyProfile(), { ...r, updatedAt: "invalid" }),
  );
  assert.throws(() => saveReview(emptyProfile(), { ...r, drinkId: "missing" }));
  assert.throws(() => parseProfile({ ...emptyProfile(), reviews: [r, r] }));
});

test("expanded catalog preserves existing IDs, resolves optional ingredients, and quarantines drafts", () => {
  assert.equal(drinks.length, 667);
  assert.equal(drinks.filter((d) => d.id.startsWith("ba-")).length, 647);
  assert.equal(drinks.filter((d) => d.needsReview).length, 7);
  const ids = new Set(ingredients.map((i) => i.id));
  assert.equal(ids.size, ingredients.length);
  for (const d of drinks) {
    for (const n of [...d.needs, ...(d.optionalNeeds ?? [])])
      assert.ok(ids.has(n.id), d.id + " missing " + n.id);
    if (d.needsReview) assert.equal(matches(d, defaultPreferences()), false);
  }
  const old = saveReview(emptyProfile(), {
    drinkId: "margarita",
    rating: 5,
    note: "Keep this review",
    updatedAt: "2026-11-16T20:00:00.000Z",
  });
  assert.equal(parseProfile(old).reviews[0].drinkId, "margarita");
});
test("all visitors use the published bar while private inventory and reviews remain recoverable", () => {
  const p = addInventory(emptyProfile(), "gin", "Private bottle", "private");
  p.tools = ["spoon"];
  const active = withSharedBar(p);
  assert.deepEqual(active.items, sharedBar.items);
  assert.deepEqual(active.tools, sharedBar.tools);
  assert.equal(p.items[0].name, "Private bottle");
  assert.notEqual(active.items, p.items);
  assert.equal(parseProfile(p).items[0].name, "Private bottle");
});
test("retailer links are direct and encode product text without changing destinations", () => {
  const hosts = [
    "www.totalwine.com",
    "bevmo.com",
    "www.instacart.com",
    "www.amazon.com",
  ];
  retailers.forEach((r, i) => {
    const u = new URL(searchURL("Gin & citrus / 750 ml", r));
    assert.equal(u.hostname, hosts[i]);
    assert.equal(u.protocol, "https:");
    assert.ok([...u.searchParams.values()].includes("Gin & citrus / 750 ml"));
  });
});
test("retailer coverage requires each item explicitly checked available; checks survive backups", () => {
  let p = addShopping(emptyProfile(), "gin", "Gin", "Restock");
  p = addShopping(p, "vodka", "Vodka", "Restock");
  assert.equal(retailerSummary(p.shopping, "BevMo").allConfirmed, false);
  p = checkRetailer(p, p.shopping[0], "BevMo", "available");
  assert.equal(retailerSummary(p.shopping, "BevMo").confirmed, 1);
  assert.equal(retailerSummary(p.shopping, "BevMo").allConfirmed, false);
  p = checkRetailer(p, p.shopping[1], "BevMo", "available");
  assert.equal(retailerSummary(p.shopping, "BevMo").allConfirmed, true);
  assert.deepEqual(parseProfile(p), p);
  p = checkRetailer(p, p.shopping[0], "BevMo", "unavailable");
  assert.equal(retailerSummary(p.shopping, "BevMo").allConfirmed, false);
  assert.equal(retailerSummary([], "BevMo").allConfirmed, false);
  const bad = {
    ...p,
    shopping: [
      {
        ...p.shopping[0],
        retailerChecks: {
          Unknown: { status: "available", checkedAt: "invalid" },
        },
      },
    ],
  };
  assert.throws(() => parseProfile(bad));
});

test("fridge inventory deduplicates repeated photos and preserves product distinctions", () => {
  const fridge = sharedBar.items.filter((i) => i.location === "Fridge");
  assert.equal(fridge.length, 15);
  assert.ok(fridge.every((i) => i.quantity === 1));
  assert.equal(new Set(fridge.map((i) => i.id)).size, 15);
  assert.equal(
    fridge.find((i) => i.name.includes("Soonhari"))?.ingredient,
    "lychee-soju",
  );
  assert.equal(
    fridge.find((i) => i.name.includes("Exquise"))?.ingredient,
    "ba-white-wine",
  );
  assert.deepEqual(
    parseProfile({ ...emptyProfile(), items: fridge }).items,
    fridge,
  );
  const p = { ...emptyProfile(), items: fridge };
  const ids = new Set(inspect(drink("margarita"), p).missing.map((n) => n.id));
  assert.ok(ids.has("lime"));
  assert.ok(ids.has("tequila"));
  assert.ok(
    inspect(drink("cuba-libre"), p).missing.some((n) => n.id === "cola"),
  );
  assert.ok(
    inspect(drink("moscow-mule"), p).missing.some(
      (n) => n.id === "ginger-beer",
    ),
  );
  assert.throws(() =>
    parseProfile({
      ...emptyProfile(),
      items: [{ ...fridge[0], location: "" }],
    }),
  );
});

test("the same product in different locations keeps separate inventory rows", () => {
  const item = sharedBar.items[0];
  const p = parseProfile({
    ...emptyProfile(),
    items: [
      item,
      { ...item, id: "other-location", location: "Pantry", quantity: 2 },
    ],
  });
  assert.equal(p.items.length, 2);
  assert.equal(p.items[0].quantity, 1);
  assert.equal(p.items[1].quantity, 2);
});
