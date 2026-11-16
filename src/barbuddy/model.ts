import { drinks, equipment, ingredients, type Drink } from "./catalog.ts";
export type Stock = "have" | "low" | "out" | "unknown";
export type Item = {
  id: string;
  ingredient: string;
  name: string;
  stock: Stock;
};
export type ShoppingItem = {
  ingredient: string;
  name: string;
  reasons: string[];
  note: string;
};
export type Profile = {
  version: 1;
  items: Item[];
  tools: string[];
  shopping: ShoppingItem[];
};
export type Preferences = {
  taste: string;
  spirit: string;
  effort: string;
  style: string;
  avoid: string[];
};
export const emptyProfile = (): Profile => ({
  version: 1,
  items: [],
  tools: [],
  shopping: [],
});
export const defaultPreferences = (): Preferences => ({
  taste: "Any",
  spirit: "Any",
  effort: "Any",
  style: "Any",
  avoid: [],
});
export const STORAGE_KEY = "barbuddy.profile.v1";
const ingredientIds = new Set(ingredients.map((i) => i.id));
const toolIds = new Set(equipment.map((i) => i.id));
function text(value: unknown, max = 180): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= max
  );
}
export function parseProfile(value: unknown): Profile {
  if (!value || typeof value !== "object")
    throw new Error("Choose a BarBuddy JSON export.");
  const p = value as Partial<Profile>;
  if (
    p.version !== 1 ||
    !Array.isArray(p.items) ||
    !Array.isArray(p.tools) ||
    !Array.isArray(p.shopping)
  )
    throw new Error("Unsupported or incomplete BarBuddy file.");
  if (p.items.length > 500 || p.shopping.length > 500)
    throw new Error("This file has too many entries.");
  const ids = new Set<string>();
  const items = p.items.map((i) => {
    if (
      !i ||
      !text(i.id, 100) ||
      ids.has(i.id) ||
      !ingredientIds.has(i.ingredient) ||
      !text(i.name) ||
      !["have", "low", "out", "unknown"].includes(i.stock)
    )
      throw new Error("Invalid or duplicate inventory entry.");
    ids.add(i.id);
    return {
      id: i.id,
      ingredient: i.ingredient,
      name: i.name.trim(),
      stock: i.stock,
    };
  });
  if (!p.tools.every((id) => toolIds.has(id)))
    throw new Error("Unknown equipment in file.");
  const shoppingKeys = new Set<string>();
  const shopping = p.shopping.map((s) => {
    if (
      !s ||
      !ingredientIds.has(s.ingredient) ||
      !text(s.name) ||
      !Array.isArray(s.reasons) ||
      s.reasons.length > 100 ||
      !s.reasons.every((r) => text(r, 180)) ||
      typeof s.note !== "string" ||
      s.note.length > 500
    )
      throw new Error("Invalid shopping entry.");
    const key = s.ingredient + "|" + s.name.toLowerCase();
    if (shoppingKeys.has(key)) throw new Error("Duplicate shopping entry.");
    shoppingKeys.add(key);
    return {
      ingredient: s.ingredient,
      name: s.name.trim(),
      reasons: [...new Set(s.reasons)],
      note: s.note,
    };
  });
  return { version: 1, items, tools: [...new Set(p.tools)], shopping };
}
export function available(profile: Profile): Set<string> {
  return new Set(
    profile.items
      .filter((i) => i.stock === "have" || i.stock === "low")
      .map((i) => i.ingredient),
  );
}
export function inspect(drink: Drink, profile: Profile) {
  const have = available(profile);
  return {
    missing: drink.needs.filter((n) => !have.has(n.id)),
    tools: drink.tools.filter((t) => !profile.tools.includes(t)),
    low: drink.needs.filter(
      (n) =>
        profile.items.some((i) => i.ingredient === n.id && i.stock === "low") &&
        !profile.items.some((i) => i.ingredient === n.id && i.stock === "have"),
    ),
  };
}
export function matches(drink: Drink, p: Preferences) {
  return (
    !drink.needs.some((n) => p.avoid.includes(n.id)) &&
    (p.spirit === "Any" || drink.spirit === p.spirit) &&
    (p.effort === "Any" || drink.effort === p.effort) &&
    (p.style === "Any" || drink.style === p.style)
  );
}
export function score(drink: Drink, p: Preferences) {
  return p.taste !== "Any" && drink.taste.includes(p.taste) ? 10 : 0;
}
export function ranked(profile: Profile, p: Preferences) {
  return drinks
    .filter((d) => matches(d, p))
    .map((drink) => ({ drink, ...inspect(drink, profile) }))
    .sort(
      (a, b) =>
        Number(a.missing.length + a.tools.length > 0) -
          Number(b.missing.length + b.tools.length > 0) ||
        score(b.drink, p) - score(a.drink, p) ||
        a.missing.length - b.missing.length ||
        a.tools.length - b.tools.length ||
        a.drink.name.localeCompare(b.drink.name),
    );
}
export function unlocks(profile: Profile, p: Preferences) {
  const candidates = drinks
    .filter((d) => matches(d, p))
    .map((drink) => ({ drink, ...inspect(drink, profile) }))
    .filter((d) => d.missing.length === 1 && d.tools.length === 0);
  return ingredients
    .map((i) => ({
      ...i,
      drinks: candidates
        .filter((d) => d.missing[0].id === i.id)
        .map((d) => d.drink),
    }))
    .filter((i) => i.drinks.length)
    .sort(
      (a, b) =>
        b.drinks.length - a.drinks.length || a.name.localeCompare(b.name),
    );
}
export function addShopping(
  profile: Profile,
  ingredient: string,
  name: string,
  reason: string,
): Profile {
  const existing = profile.shopping.find(
    (s) =>
      s.ingredient === ingredient &&
      s.name.toLowerCase() === name.toLowerCase(),
  );
  return {
    ...profile,
    shopping: existing
      ? profile.shopping.map((s) =>
          s === existing
            ? { ...s, reasons: [...new Set([...s.reasons, reason])] }
            : s,
        )
      : [
          ...profile.shopping,
          { ingredient, name, reasons: [reason], note: "" },
        ],
  };
}
export function searchURL(name: string, retailer = "Web") {
  const query = (retailer === "Web" ? "" : retailer + " ") + name + " buy";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
