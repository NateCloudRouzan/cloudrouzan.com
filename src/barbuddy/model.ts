import {
  retailers,
  retailerURL,
  type Retailer,
  type RetailerCheck,
} from "./retailers.ts";
import { drinks, equipment, ingredients, ingredientName, type Drink } from "./catalog.ts";
export type Stock = "have" | "low" | "out" | "unknown";
export type Item = {
  id: string;
  ingredient: string;
  name: string;
  stock: Stock;
  quantity: number;
  location?: string;
  notes?: string;
};
export type ShoppingItem = {
  ingredient: string;
  name: string;
  reasons: string[];
  note: string;
  retailerChecks?: Partial<Record<Retailer, RetailerCheck>>;
};
export type Review = {
  drinkId: string;
  rating: number;
  note: string;
  updatedAt: string;
};
export type Profile = {
  version: 3;
  items: Item[];
  tools: string[];
  shopping: ShoppingItem[];
  reviews: Review[];
};
export type Preferences = {
  taste: string;
  spirit: string;
  effort: string;
  style: string;
  avoid: string[];
};
export const emptyProfile = (): Profile => ({
  version: 3,
  items: [],
  tools: [],
  shopping: [],
  reviews: [],
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
  const p = value as Partial<Omit<Profile, "version">> & { version?: number };
  if (
    (p.version !== 1 && p.version !== 2 && p.version !== 3) ||
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
    const quantity = p.version === 1 ? (i.stock === "out" ? 0 : 1) : i.quantity;
    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 0 ||
      quantity > MAX_QUANTITY
    )
      throw new Error(
        "Inventory quantities must be whole numbers from 0 to 9999.",
      );
    if (i.location !== undefined && !text(i.location, 80))
      throw new Error("Invalid inventory location.");
    if (
      i.notes !== undefined &&
      (typeof i.notes !== "string" || i.notes.length > 500)
    )
      throw new Error("Invalid inventory note.");
    ids.add(i.id);
    return {
      ...(i.location !== undefined ? { location: i.location.trim() } : {}),
      ...(i.notes !== undefined ? { notes: i.notes.trim() } : {}),
      id: i.id,
      ingredient: i.ingredient,
      name: i.name.trim(),
      stock: quantity === 0 ? ("out" as Stock) : i.stock,
      quantity,
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
    let retailerChecks: ShoppingItem["retailerChecks"];
    if (s.retailerChecks !== undefined) {
      if (
        !s.retailerChecks ||
        typeof s.retailerChecks !== "object" ||
        Array.isArray(s.retailerChecks)
      )
        throw new Error("Invalid retailer availability checks.");
      retailerChecks = {};
      for (const [store, check] of Object.entries(s.retailerChecks)) {
        if (
          !retailers.includes(store as Retailer) ||
          !check ||
          !["available", "unavailable"].includes(check.status) ||
          typeof check.checkedAt !== "string" ||
          !Number.isFinite(Date.parse(check.checkedAt))
        )
          throw new Error("Invalid retailer availability check.");
        retailerChecks[store as Retailer] = {
          status: check.status,
          checkedAt: check.checkedAt,
        };
      }
    }
    return {
      ...(retailerChecks ? { retailerChecks } : {}),
      ingredient: s.ingredient,
      name: s.name.trim(),
      reasons: [...new Set(s.reasons)],
      note: s.note,
    };
  });
  const reviews: Review[] = [];
  if (p.version === 3) {
    if (!Array.isArray(p.reviews) || p.reviews.length > drinks.length)
      throw new Error("Invalid review collection.");
    const reviewed = new Set<string>();
    for (const review of p.reviews) {
      validateReview(review);
      if (reviewed.has(review.drinkId))
        throw new Error("Duplicate drink review.");
      reviewed.add(review.drinkId);
      reviews.push({
        drinkId: review.drinkId,
        rating: review.rating,
        note: review.note.trim(),
        updatedAt: review.updatedAt,
      });
    }
  }
  return {
    version: 3,
    reviews,
    items: consolidateItems(items),
    tools: [...new Set(p.tools)],
    shopping,
  };
}
// Directional matches: specific stock can satisfy a broader recipe requirement.
const ingredientAliases: Record<string, string[]> = {
  "japanese-whisky": ["ba-japanese-whiskey", "ba-whiskey"],
  "ba-japanese-whiskey": ["japanese-whisky", "ba-whiskey"],
  bourbon: ["ba-whiskey"], rye: ["ba-whiskey"],
  "ba-irish-whiskey": ["ba-whiskey"],
  "ba-scotch-whiskey": ["ba-whiskey"],
  "ba-blended-scotch-whisky": ["ba-scotch-whiskey", "ba-whiskey"],
  "ba-islay-scotch-whiskey": ["ba-scotch-whiskey", "ba-whiskey"],
  "ba-lime": ["lime"], "ba-lemon": ["lemon"],
  "bottled-lime": ["lime"], "bottled-lemon": ["lemon"], "bottled-orange": ["orange"],
  "ba-tequila-blanco": ["tequila", "ba-tequila"],
  "ba-tequila-reposado": ["tequila", "ba-tequila"],
  tequila: ["ba-tequila"],
  "amber-curacao": ["ba-dry-curacao", "ba-orange-curacao"],
  "ba-dry-curacao": ["amber-curacao", "ba-orange-curacao"],
  aromatic: ["ba-bitters"], angostura: ["aromatic", "ba-bitters"],
  "portland-pomegranate-cherry": ["grenadine"],
  rum: ["ba-rum"],
};
// Owner-approved prepared mixers require the carbonator and stocked concentrate.
function suppliedIngredients(item: Item, profile: Profile): string[] {
  const prepared: Record<string, string[]> = {
    "tonic-concentrate": ["tonic"],
    "diet-cola-concentrate": ["cola", "cola-zero", "ba-cola"],
    "diet-ginger-ale-concentrate": ["ginger-ale"],
    "diet-lemon-lime-concentrate": ["lemon-lime-soda"],
  };
  const supplied = new Set([item.ingredient, ...(profile.tools.includes("aarke") ? prepared[item.ingredient] ?? [] : [])]);
  for (const id of supplied) for (const alias of ingredientAliases[id] ?? []) supplied.add(alias);
  return [...supplied];
}
export function available(profile: Profile): Set<string> {
  return new Set(
    profile.items
      .filter(
        (i) => i.quantity > 0 && (i.stock === "have" || i.stock === "low"),
      )
      .flatMap((i) => suppliedIngredients(i, profile)),
  );
}
export function inspect(drink: Drink, profile: Profile) {
  const have = available(profile);
  return {
    missing: drink.needs.filter((n) => !have.has(n.id)),
    tools: drink.tools.filter((t) => !profile.tools.includes(t)),
    substitutions: drink.needs.flatMap((n) => {
      const stocked = profile.items.filter(i => i.quantity > 0 && (i.stock === "have" || i.stock === "low"));
      if (stocked.some(i => i.ingredient === n.id)) return [];
      const item = [...stocked].sort((a,b) => Number(["ba-lemon", "ba-lime"].includes(b.ingredient)) - Number(["ba-lemon", "ba-lime"].includes(a.ingredient))).find(i => suppliedIngredients(i, profile).includes(n.id));
      if (!item) return [];
      if (["ba-lemon", "ba-lime"].includes(item.ingredient)) return [`Juice the ${item.name.toLowerCase()} for ${ingredientName(n.id)}.`];
      const fresh = ["bottled-lime", "bottled-lemon", "bottled-orange"].includes(item.ingredient);
      return [`Use ${item.name} for ${ingredientName(n.id)}.${fresh ? " Fresh is preferred for the best flavor." : " Flavor may differ from the recipe’s original ingredient."}`];
    }),
    low: drink.needs.filter(
      (n) =>
        profile.items.some(
          (i) => suppliedIngredients(i, profile).includes(n.id) && i.quantity > 0 && i.stock === "low",
        ) &&
        !profile.items.some(
          (i) => suppliedIngredients(i, profile).includes(n.id) && i.quantity > 0 && i.stock === "have",
        ),
    ),
  };
}
export function matches(drink: Drink, p: Preferences, includeReview = false) {
  return (
    (!drink.needsReview || includeReview) &&
    !drink.needs.some((n) => p.avoid.includes(n.id)) &&
    (p.spirit === "Any" || drink.spirit === p.spirit) &&
    (p.effort === "Any" || drink.effort === p.effort) &&
    (p.style === "Any" || drink.style === p.style)
  );
}
export function score(drink: Drink, p: Preferences) {
  return p.taste !== "Any" && drink.taste.includes(p.taste) ? 10 : 0;
}
export function ranked(
  profile: Profile,
  p: Preferences,
  includeReview = false,
) {
  return drinks
    .filter((d) => matches(d, p, includeReview))
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
export function searchURL(name: string, retailer: Retailer = "Total Wine") {
  return retailerURL(name, retailer);
}
export function checkRetailer(
  profile: Profile,
  item: ShoppingItem,
  retailer: Retailer,
  status: "available" | "unavailable" | "unknown",
): Profile {
  return {
    ...profile,
    shopping: profile.shopping.map((s) => {
      if (s !== item) return s;
      const checks = { ...s.retailerChecks };
      if (status === "unknown") delete checks[retailer];
      else checks[retailer] = { status, checkedAt: new Date().toISOString() };
      return { ...s, retailerChecks: checks };
    }),
  };
}
export function retailerSummary(shopping: ShoppingItem[], retailer: Retailer) {
  const confirmed = shopping.filter(
    (s) => s.retailerChecks?.[retailer]?.status === "available",
  ).length;
  return {
    confirmed,
    total: shopping.length,
    allConfirmed: shopping.length > 0 && confirmed === shopping.length,
  };
}

// Keep the storage key stable so existing version-1 saves are found and migrated.
export const MAX_QUANTITY = 9999;
export const productKey = (ingredient: string, name: string) =>
  ingredient + "|" + name.trim().replace(/\s+/g, " ").toLowerCase();

export function consolidateItems(items: Item[]): Item[] {
  const result: Item[] = [];
  const priority: Record<Stock, number> = {
    out: 0,
    unknown: 1,
    low: 2,
    have: 3,
  };
  for (const item of items) {
    const existing = result.find(
      (i) =>
        productKey(i.ingredient, i.name) ===
          productKey(item.ingredient, item.name) &&
        (i.location ?? "").trim().toLowerCase() ===
          (item.location ?? "").trim().toLowerCase(),
    );
    if (!existing) {
      result.push({ ...item });
      continue;
    }
    if (existing.quantity + item.quantity > MAX_QUANTITY)
      throw new Error("Combined inventory quantity exceeds 9999.");
    existing.quantity += item.quantity;
    if (priority[item.stock] > priority[existing.stock])
      existing.stock = item.stock;
  }
  return result;
}
export function addInventory(
  profile: Profile,
  ingredient: string,
  name: string,
  id: string,
): Profile {
  const existing = profile.items.find(
    (i) => productKey(i.ingredient, i.name) === productKey(ingredient, name),
  );
  return {
    ...profile,
    items: existing
      ? profile.items.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: Math.min(MAX_QUANTITY, i.quantity + 1),
                stock: "have",
              }
            : i,
        )
      : [
          ...profile.items,
          { id, ingredient, name: name.trim(), stock: "have", quantity: 1 },
        ],
  };
}
export function setQuantity(item: Item, quantity: number): Item {
  return {
    ...item,
    quantity,
    stock: quantity === 0 ? "out" : item.stock === "out" ? "have" : item.stock,
  };
}
export function isInInventory(
  profile: Profile,
  ingredient: string,
  name: string,
): boolean {
  // Named products stay distinct; a generic category is hidden once represented.
  return profile.items.some(
    (i) =>
      productKey(i.ingredient, i.name) === productKey(ingredient, name) ||
      (ingredients.find((n) => n.id === ingredient)?.name === name &&
        i.ingredient === ingredient),
  );
}

export const MAX_REVIEW_NOTE = 2000;
function validateReview(review: Review): void {
  if (
    !review ||
    !drinks.some((d) => d.id === review.drinkId) ||
    !Number.isInteger(review.rating) ||
    review.rating < 1 ||
    review.rating > 5 ||
    typeof review.note !== "string" ||
    review.note.length > MAX_REVIEW_NOTE ||
    typeof review.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(review.updatedAt))
  )
    throw new Error(
      "Reviews need a supported drink, 1–5 stars, a note of at most 2000 characters, and a valid date.",
    );
}
export function saveReview(profile: Profile, review: Review): Profile {
  validateReview(review);
  const normalized = { ...review, note: review.note.trim() };
  return {
    ...profile,
    reviews: [
      normalized,
      ...profile.reviews.filter((r) => r.drinkId !== review.drinkId),
    ],
  };
}
