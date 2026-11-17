import { ingredients } from "./catalog.ts";
import type { Item } from "./model.ts";

const categoryIngredients: Record<string, string[]> = {
  Spirits: ["ba-tequila-reposado", "ba-tequila-blanco", "ba-absinthe", "ba-mezcal"],
  "Liqueurs & aperitifs": ["goldschlager", "aperix", "ba-amaro", "ba-creme-de-violette"],
  Juices: ["ginger-blend", "bottled-lemon", "bottled-lime", "bottled-orange", "fruit-punch", "pineapple-juice", "lime", "lemon", "orange", "pineapple"],
  Syrups: ["syrup", "grenadine", "portland-georgia-peach", "portland-ube", "portland-pomegranate-cherry"],
  "Bitters & tinctures": ["aromatic", "angostura", "peach-bitters", "chocolate-bitters", "ba-orange-bitters", "fire-tincture"],
  "Mixers & soda concentrates": ["tonic-concentrate", "diet-cola-concentrate", "diet-ginger-ale-concentrate", "diet-lemon-lime-concentrate", "peach-ginger", "soda", "water", "cola", "cola-zero", "tonic", "ginger-ale", "lemon-lime-soda", "ginger-beer", "grapefruit-seltzer"],
  "Wine & beer": ["ba-white-wine", "ba-red-wine", "wine-unconfirmed", "prosecco", "stout"],
  "Ready-to-drink cocktails": ["premix", "tamarind-margarita-premix"],
  "Coffee & tea": ["ba-coffee", "ba-tea", "matcha"],
  "Fruit, garnishes & rims": ["ba-lemon", "ba-lime", "cherries", "dehydrated-lemon", "cosmo-rimmer", "tajin-rim"],
  "Flavorings & extras": ["ube-flavouring", "jasmine-essence", "ice", "sugar", "sugar-cube"],
};
export const inventoryCategories = [...Object.keys(categoryIngredients), "Other ingredients"];
export function inventoryCategory(ingredientId: string): string {
  const explicit = Object.entries(categoryIngredients).find(([, ids]) => ids.includes(ingredientId));
  if (explicit) return explicit[0];
  const category = ingredients.find(i => i.id === ingredientId)?.category;
  return category === "Spirits" || category === "Liqueurs & aperitifs" ? category : "Other ingredients";
}
export function groupInventory(items: Item[], location = "All locations", category = "All categories") {
  return inventoryCategories.map(name => ({
    name,
    items: items.filter(item => inventoryCategory(item.ingredient) === name &&
      (location === "All locations" || (item.location ?? "Unspecified") === location) &&
      (category === "All categories" || category === name))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(group => group.items.length > 0);
}
