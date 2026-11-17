import data from "./data/book-index.json" with { type: "json" };
import { drinks } from "./catalog.ts";
export const bookIndex = data;
export type BookEntry = (typeof data.entries)[number];
export const bookStatus = (entry: BookEntry) => entry.recipeIds.length ? "Reference available" : entry.relatedIds.length ? "Check variant" : "Recipe needed";
export function searchBook(query: string, status = "All entries") {
  const q = query.trim().toLocaleLowerCase();
  return data.entries.filter(entry => (status === "All entries" || bookStatus(entry) === status) && (!q || entry.name.toLocaleLowerCase().includes(q) || entry.pages.some(page => String(page) === q)));
}
export function bookCSV(entries: BookEntry[]) {
  const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return ["Cocktail,Book pages,Status,Notes,Published references", ...entries.map(entry => [entry.name, entry.pages.join(", "), bookStatus(entry), entry.note ?? "", [...entry.recipeIds, ...entry.relatedIds].map(id => drinks.find(d => d.id === id)?.source ?? "").join(" | ")].map(cell).join(","))].join("\r\n");
}
