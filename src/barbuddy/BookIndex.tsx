import { useState } from "react";
import { drinks } from "./catalog";
import { bookIndex, bookStatus, searchBook, bookCSV } from "./book-index";
export default function BookIndex({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All entries");
  const [limit, setLimit] = useState(30);
  const rows = searchBook(query, filter);
  const counts = { known: bookIndex.entries.filter(e => e.recipeIds.length).length, related: bookIndex.entries.filter(e => e.relatedIds.length).length };
  function download() {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + bookCSV(rows)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "barbuddy-book-recipe-checklist.csv"; a.click(); URL.revokeObjectURL(url);
  }
  return <>
    <div className="bb-section-title"><p className="eyebrow">06 / YOUR BOOK</p><h2>Book recipe checklist</h2><p className="bb-muted">{bookIndex.title} · ISBN {bookIndex.isbn}</p></div>
    <p>{bookIndex.entries.length} index entries · {counts.known} reference recipes available · {counts.related} variants to check · {bookIndex.entries.length - counts.known - counts.related} recipes needed.</p>
    <p className="bb-notice">Transcribed from your four index photos. They yielded 500 named entries; the title says 501. Page numbers are copied from the index and may include a recipe and its photo. A matching name links to a published reference recipe, not a verified transcription of the book’s version.</p>
    <div className="bb-filters">
      <label>Search book names or page number<input type="search" value={query} onChange={e => {setQuery(e.target.value);setLimit(30);}} /></label>
      <label>Recipe status<select aria-label="Recipe status" value={filter} onChange={e => {setFilter(e.target.value);setLimit(30);}}>{["All entries", "Reference available", "Check variant", "Recipe needed"].map(s => <option key={s}>{s}</option>)}</select></label>
    </div>
    <div className="bb-actions"><button onClick={download}>Download this checklist (CSV)</button><span>{rows.length} matching entries</span></div>
    <div className="bb-shared-items">{rows.slice(0, limit).map(entry => <article className="bb-panel" key={entry.id}>
      <p className="eyebrow">{bookStatus(entry)}</p><h3>{entry.name}</h3><p>Book {entry.pages.length === 1 ? "page" : "pages"} {entry.pages.join(", ")}</p>
      {entry.note && <p className="bb-warning">{entry.note}</p>}
      {entry.recipeIds.length > 0 && <p className="bb-footnote">Known reference; compare the book page if you want its exact proportions.</p>}
      {entry.relatedIds.length > 0 && <p className="bb-footnote">A related or incomplete recipe exists. Please get the listed book page to confirm this version.</p>}
      {!entry.recipeIds.length && !entry.relatedIds.length && <p className="bb-footnote">Get this recipe page from your book. No recipe has been inferred from its name.</p>}
      {[...entry.recipeIds, ...entry.relatedIds].map(id => { const drink = drinks.find(d => d.id === id)!; return <button key={id} onClick={() => onOpen(id)}>View {drink.name}{entry.relatedIds.length ? " (check version)" : ""}</button>; })}
    </article>)}</div>
    {!rows.length && <p>No entries match this search.</p>}
    {rows.length > limit && <button onClick={() => setLimit(n => n + 30)}>Show more book entries ({rows.length - limit} remaining)</button>}
  </>;
}
