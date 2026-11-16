import test from "node:test";
import assert from "node:assert/strict";
import { drinks } from "../src/barbuddy/catalog.ts";
import {
  emptyProfile,
  defaultPreferences,
  inspect,
  unlocks,
  matches,
  parseProfile,
  addShopping,
  searchURL,
} from "../src/barbuddy/model.ts";
const drink = (id: string) => drinks.find((d) => d.id === id)!;
test("low counts as available; out/unknown do not; duplicate bottles do not hide low correctly", () => {
  const p = emptyProfile();
  p.items = [
    { id: "v", ingredient: "vodka", name: "Vodka", stock: "low" },
    { id: "s", ingredient: "soda", name: "Water", stock: "out" },
    { id: "i", ingredient: "ice", name: "Ice", stock: "unknown" },
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
    stock: "have" as const,
  }));
  const soda = unlocks(p, defaultPreferences()).find((u) => u.id === "soda")!;
  assert.equal(soda.drinks.length, 3);
  assert.equal(new Set(soda.drinks.map((d) => d.id)).size, 3);
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
  assert.throws(() => parseProfile({ ...p, version: 2 }));
  assert.throws(() => parseProfile({ ...p, tools: ["unknown"] }));
  const i = { id: "x", ingredient: "vodka", name: "Vodka", stock: "have" };
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
  assert.equal(u.hostname, "www.google.com");
  assert.equal(u.searchParams.get("q"), "Gin & citrus buy");
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
          stock: "have",
        })),
      }),
    );
  }
});
