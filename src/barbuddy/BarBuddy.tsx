import { useEffect, useRef, useState } from "react";
import {
  drinks,
  ingredients,
  ingredientName,
  equipment,
  type Drink,
} from "./catalog";
import {
  STORAGE_KEY,
  saveReview,
  type Review,
  emptyProfile,
  defaultPreferences,
  parseProfile,
  ranked,
  unlocks,
  addShopping,
  searchURL,
  checkRetailer,
  retailerSummary,
  type Profile,
  type ShoppingItem,
} from "./model";
import "./barbuddy.css";
import ReviewEditor from "./ReviewEditor";
import { sharedBar, withSharedBar } from "./shared-bar";
import { retailers, type Retailer } from "./retailers";
import importReport from "./data/import-report.json";
const tabs = [
  "Find a drink",
  "The bar",
  "Unlock more",
  "Shopping list",
  "My reviews",
] as const;
type Tab = (typeof tabs)[number];
function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return {
      profile: saved ? parseProfile(JSON.parse(saved)) : emptyProfile(),
      error: "",
    };
  } catch {
    return {
      profile: emptyProfile(),
      error:
        "Saved inventory could not be read. Your existing save has not been replaced. Import a backup or choose Start fresh.",
    };
  }
}
export default function BarBuddy() {
  const [initial] = useState(load);
  const [profile, setProfile] = useState<Profile>(initial.profile);
  const [storageError, setStorageError] = useState(initial.error);
  const [blocked, setBlocked] = useState(Boolean(initial.error));
  const [tab, setTab] = useState<Tab>("Find a drink");
  const [prefs, setPrefs] = useState(defaultPreferences);
  const [drinkQuery, setDrinkQuery] = useState("");
  const [limit, setLimit] = useState(24);
  const [avoidQuery, setAvoidQuery] = useState("");
  const [status, setStatus] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [offset, setOffset] = useState(0);
  const [retailer, setRetailer] = useState<Retailer | "All retailers">(
    "All retailers",
  );
  const [reviewDrink, setReviewDrink] = useState(drinks[0].id);
  const [pending, setPending] = useState<Profile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.title = "BarBuddy · cloudrouzan.com";
  }, []);
  useEffect(() => {
    if (blocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setStorageError("");
    } catch {
      setStorageError(
        "Changes could not be saved in this browser. Export a backup before leaving.",
      );
    }
  }, [profile, blocked]);
  const activeBar = withSharedBar(profile);
  const results = ranked(activeBar, prefs, showAll).filter((r) =>
    (r.drink.name + " " + r.drink.description)
      .toLowerCase()
      .includes(drinkQuery.toLowerCase()),
  );
  const ready = results.filter(
    (r) => !r.drink.needsReview && !r.missing.length && !r.tools.length,
  );
  const suggestions = unlocks(activeBar, prefs);
  const view = showAll
    ? results.slice(0, limit)
    : ready.length
      ? Array.from(
          { length: Math.min(3, ready.length) },
          (_, i) => ready[(offset + i) % ready.length],
        )
      : results.slice(0, 3);
  function shop(ingredient: string, name: string, reason: string) {
    setProfile((p) => addShopping(p, ingredient, name, reason));
    setStatus(`${name} added to your shopping list.`);
  }
  function exportProfile() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "barbuddy-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Backup exported. Keep it somewhere private.");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1_000_000)
        throw new Error("Choose a file smaller than 1 MB.");
      setPending(parseProfile(JSON.parse(await file.text())));
      setStatus("Review the import below before replacing your current bar.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not read this file.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }
  function purchased(item: ShoppingItem) {
    setProfile((p) => ({
      ...p,
      shopping: p.shopping.filter((s) => s !== item),
    }));
    setStatus(
      "Removed from your shopping list. Tell Nate to update the shared bar through chat.",
    );
  }
  return (
    <main className="page bb">
      <header className="bb-top">
        <a href="/">
          cloudrouzan.com <span>/ projects</span>
        </a>
        <span className="bb-local">
          <i />{" "}
          {storageError
            ? "Local save needs attention"
            : "Shared bar · private reviews"}
        </span>
      </header>
      <section className="bb-hero">
        <div>
          <p className="eyebrow">A little less guessing. A better drink.</p>
          <h1>
            Meet your
            <br />
            <em>BarBuddy.</em>
          </h1>
          <p className="intro">
            Nate’s bar. Your taste. Your next cocktail.
            <br />
            Find what you can make—and what opens up next.
          </p>
          <a className="bb-text-link" href="#barbuddy-workspace">
            Let’s mix something <span>↓</span>
          </a>
        </div>
        <div className="bb-art" aria-hidden="true">
          <div className="bb-art-orbit" />
          <div className="bb-glass">
            <div className="bb-liquid">
              <div className="bb-ice one" />
              <div className="bb-ice two" />
              <div className="bb-ice three" />
            </div>
            <div className="bb-orange" />
          </div>
          <p>
            GOOD THINGS
            <br />
            ALREADY ON YOUR SHELF.
          </p>
          <span className="bb-art-mark">BB / 01</span>
        </div>
      </section>
      <div className="bb-stats">
        <span>
          <strong>
            {
              activeBar.items.filter(
                (i) => i.stock === "have" || i.stock === "low",
              ).length
            }
          </strong>{" "}
          items on hand
        </span>
        <span>
          <strong>{ready.length}</strong> matching drinks ready
        </span>
        <span>
          <strong>{drinks.length}</strong> recipes to explore
        </span>
      </div>
      {storageError && (
        <div className="bb-notice" role="alert">
          {storageError}{" "}
          {blocked && (
            <button
              onClick={() => {
                setBlocked(false);
                setProfile(emptyProfile());
              }}
            >
              Start fresh
            </button>
          )}
        </div>
      )}
      <section
        id="barbuddy-workspace"
        className="bb-workspace"
        aria-label="BarBuddy workspace"
      >
        <nav className="bb-tabs" aria-label="BarBuddy sections">
          {tabs.map((t) => (
            <button
              key={t}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Shopping list" && profile.shopping.length > 0 && (
                <span className="bb-count">{profile.shopping.length}</span>
              )}
            </button>
          ))}
        </nav>
        <p className="bb-status" role="status">
          {status}
        </p>
        {tab === "Find a drink" && (
          <>
            <div className="bb-section-title">
              <div>
                <p className="eyebrow">01 / Find your pour</p>
                <h2>What sounds good?</h2>
              </div>
              <button
                className="bb-quiet"
                onClick={() => {
                  setPrefs(defaultPreferences());
                  setOffset(0);
                }}
              >
                Reset preferences
              </button>
            </div>
            {!activeBar.items.length && (
              <div className="bb-notice">
                <strong>
                  The shared bar is waiting for an inventory session.
                </strong>
                <p>
                  Browse the full catalog now. Nate’s confirmed inventory will
                  be published here for every visitor after we take stock
                  together.
                </p>
                <button
                  className="bb-primary"
                  onClick={() => setTab("The bar")}
                >
                  View shared bar ↗
                </button>
              </div>
            )}
            <label className="bb-catalog-search">
              Search cocktails
              <input
                type="search"
                placeholder="Try Negroni, a sour, or a favorite name…"
                value={drinkQuery}
                onChange={(e) => {
                  setDrinkQuery(e.target.value);
                  setLimit(24);
                }}
              />
            </label>
            <div className="bb-filters">
              <label>
                Flavor
                <select
                  value={prefs.taste}
                  onChange={(e) => {
                    setPrefs({ ...prefs, taste: e.target.value });
                    setOffset(0);
                  }}
                >
                  {[
                    "Any",
                    "Refreshing",
                    "Citrusy",
                    "Fruity",
                    "Bitter",
                    "Spirit-forward",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Base spirit
                <select
                  value={prefs.spirit}
                  onChange={(e) => {
                    setPrefs({ ...prefs, spirit: e.target.value });
                    setOffset(0);
                  }}
                >
                  {[
                    ["Any", "Any spirit"],
                    ["gin", "Gin"],
                    ["vodka", "Vodka"],
                    ["tequila", "Tequila"],
                    ["rum", "Rum"],
                    ["bourbon", "Bourbon"],
                    ["japanese-whisky", "Japanese whisky"],
                    ["cognac", "Cognac"],
                    ["rye", "Rye whiskey"],
                    ["mezcal", "Mezcal"],
                    ["scotch", "Scotch whisky"],
                    ["other", "Other bases"],
                    ["aperol-family", "Aperitifs"],
                  ].map(([v, n]) => (
                    <option key={v} value={v}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Preparation
                <select
                  value={prefs.effort}
                  onChange={(e) =>
                    setPrefs({ ...prefs, effort: e.target.value })
                  }
                >
                  {["Any", "Quick", "Shake or stir"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Style
                <select
                  value={prefs.style}
                  onChange={(e) =>
                    setPrefs({ ...prefs, style: e.target.value })
                  }
                >
                  {["Any", "Classic", "Sparkling", "Frozen"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <details className="bb-details">
              <summary>
                Ingredients to avoid{" "}
                {prefs.avoid.length > 0 && `(${prefs.avoid.length})`}
              </summary>
              <label>
                Filter ingredients
                <input
                  type="search"
                  value={avoidQuery}
                  onChange={(e) => setAvoidQuery(e.target.value)}
                  placeholder="Find an ingredient to avoid…"
                />
              </label>
              <div className="bb-checks">
                {ingredients
                  .filter((i) =>
                    i.name.toLowerCase().includes(avoidQuery.toLowerCase()),
                  )
                  .map((i) => (
                    <label key={i.id}>
                      <input
                        type="checkbox"
                        checked={prefs.avoid.includes(i.id)}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            avoid: e.target.checked
                              ? [...prefs.avoid, i.id]
                              : prefs.avoid.filter((id) => id !== i.id),
                          })
                        }
                      />
                      {i.name}
                    </label>
                  ))}
              </div>
            </details>
            <div className="bb-result-head">
              <div aria-live="polite">
                <h3>
                  {ready.length
                    ? "Ready for your bar"
                    : prefs.style === "Frozen"
                      ? "Frozen recipes for a blender"
                      : "A few possibilities"}
                </h3>
                <p>
                  {ready.length
                    ? `${ready.length} matching drinks. Flavor preferences bring your best matches to the top.`
                    : prefs.style === "Frozen"
                      ? "These recipes require a blender. Ninja SLUSHi adaptations still need model-specific verification."
                      : "No drinks are fully ready with these settings. Here’s exactly what is missing."}
                </p>
              </div>
              <div className="bb-actions">
                {ready.length > 3 && !showAll && (
                  <button
                    onClick={() => setOffset((n) => (n + 3) % ready.length)}
                  >
                    Another set ↻
                  </button>
                )}
                <button onClick={() => setShowAll((v) => !v)}>
                  {showAll
                    ? "Suggest a few"
                    : `Browse matches (${results.length})`}
                </button>
              </div>
            </div>
            {!results.length && (
              <div className="bb-empty">
                No recipes match these constraints. Change the filters or remove
                an exclusion to explore more.
              </div>
            )}
            <div className="bb-drinks">
              {view.map(({ drink, missing, tools, low }, index) => (
                <DrinkCard
                  key={drink.id}
                  drink={drink}
                  index={index}
                  missing={missing.map((n) => n.id)}
                  missingTools={tools}
                  low={low.map((n) => n.id)}
                  taste={prefs.taste}
                  onShop={shop}
                  review={profile.reviews.find((r) => r.drinkId === drink.id)}
                  onReview={() => {
                    setReviewDrink(drink.id);
                    setTab("My reviews");
                  }}
                />
              ))}
            </div>
            {showAll && view.length < results.length && (
              <button onClick={() => setLimit((n) => n + 24)}>
                Show more drinks ({results.length - view.length} remaining)
              </button>
            )}
            <details className="bb-details">
              <summary>Catalog sources & image credits</summary>
              <p className="bb-footnote">
                {importReport.importedRecipes} recipes imported from Bar
                Assistant’s MIT-licensed data, plus 20 retained BarBuddy
                recipes. {importReport.preparationReview.length} imported
                recipes need preparation or quantity verification and are
                excluded from make-now and unlock results. Existing recipe IDs
                and reviews are preserved. This collection does not claim to
                reproduce the book’s 501 recipes.
              </p>
              <a
                href="https://github.com/bar-assistant/data"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bar Assistant data ↗
              </a>{" "}
              ·{" "}
              <a href="/barbuddy/BAR-ASSISTANT-LICENSE.txt">
                MIT license notice
              </a>
              <p className="bb-footnote">
                Only individually verified photos are included; other cards use
                decorative illustrations. Margarita photo: Cocktailmarler,{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Klassiche_Margarita.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikimedia Commons
                </a>
                ,{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/3.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA 3.0
                </a>
                ; resized thumbnail, displayed cropped.
              </p>
            </details>
          </>
        )}
        {tab === "The bar" && (
          <>
            <div className="bb-section-title">
              <div>
                <p className="eyebrow">02 / Shared with every visitor</p>
                <h2>{sharedBar.name}</h2>
              </div>
              <span className="bb-muted">Updated {sharedBar.updatedAt}</span>
            </div>
            <div className="bb-notice">
              {sharedBar.status}
              <p>
                This is the same published inventory for everyone. Nate updates
                stock and equipment through chat; visitors can browse and plan
                shopping without changing the bar.
              </p>
            </div>
            {!sharedBar.items.length && (
              <div className="bb-empty">
                We’ll take inventory together next. No bottles, quantities,
                staples, or tools have been assumed.
              </div>
            )}
            <div className="bb-shared-items">
              {sharedBar.items.map((item) => (
                <article className="bb-panel" key={item.id}>
                  <h3>{item.name}</h3>
                  <p className="bb-muted">
                    {ingredientName(item.ingredient)} · Quantity {item.quantity}{" "}
                    ·{" "}
                    {item.stock === "have"
                      ? "Available"
                      : item.stock === "low"
                        ? "Running low"
                        : item.stock === "out"
                          ? "Out"
                          : "Unconfirmed"}
                  </p>
                  <button
                    onClick={() =>
                      shop(item.ingredient, item.name, "Restock shared bar")
                    }
                  >
                    Add restock to my list
                  </button>
                  <div className="bb-actions">
                    {retailers.map((r) => (
                      <a
                        key={r}
                        href={searchURL(item.name, r)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {r} ↗
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <section className="bb-panel">
              <h3>Shared equipment</h3>
              <p className="bb-muted">
                {sharedBar.tools.length
                  ? sharedBar.tools
                      .map((id) => equipment.find((t) => t.id === id)?.name)
                      .join(" · ")
                  : "Equipment will be confirmed in the inventory session."}
              </p>
              <p className="bb-footnote">
                Blender recipes are separate from Ninja SLUSHi recipes. A
                carbonator alone does not imply sparkling water is in stock.
              </p>
            </section>
            <section className="bb-panel">
              <h3>Keep a backup</h3>
              <p className="bb-muted">
                Reviews and shopping lists stay private to this browser. Exports
                also preserve any inventory you saved before the shared bar was
                introduced. Imports replace your personal backup data, not the
                published shared bar.
              </p>
              <div className="bb-actions">
                <button onClick={exportProfile}>Export backup ↓</button>
                <button onClick={() => fileRef.current?.click()}>
                  Import backup ↑
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={(e) => void importFile(e.target.files?.[0])}
                />
              </div>
              {pending && (
                <div className="bb-notice">
                  <strong>Replace personal data with this backup?</strong>
                  <p>
                    {pending.items.length} inventory items ·{" "}
                    {pending.tools.length} tools · {pending.shopping.length}{" "}
                    shopping items · {pending.reviews.length} reviews. Export
                    your current bar first if you want to keep it.
                  </p>
                  <div className="bb-actions">
                    <button
                      className="bb-primary"
                      onClick={() => {
                        setProfile(pending);
                        setPending(null);
                        setBlocked(false);
                        setStatus("Backup imported.");
                      }}
                    >
                      Replace personal data
                    </button>
                    <button onClick={() => setPending(null)}>
                      Cancel import
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        {tab === "Unlock more" && (
          <>
            <div className="bb-section-title">
              <div>
                <p className="eyebrow">03 / Open up possibilities</p>
                <h2>One ingredient. More options.</h2>
              </div>
            </div>
            <p className="bb-muted">
              Purchases below complete all missing ingredients for these drinks
              in this catalog. Your current preferences, exclusions, and
              equipment still apply.
            </p>
            {!suggestions.length && (
              <div className="bb-empty">
                No single-ingredient unlocks yet. The shared inventory will be
                confirmed next; you can also loosen your preferences in Find a
                drink.
              </div>
            )}
            <div className="bb-unlocks">
              {suggestions.map((u) => (
                <article className="bb-panel" key={u.id}>
                  <span className="bb-unlock-number">+{u.drinks.length}</span>
                  <p className="eyebrow">{u.category}</p>
                  <h3>{u.name}</h3>
                  <p>
                    Unlock {u.drinks.length}{" "}
                    {u.drinks.length === 1 ? "cocktail" : "cocktails"}
                  </p>
                  <ul>
                    {u.drinks.map((d) => (
                      <li key={d.id}>{d.name}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() =>
                      shop(
                        u.id,
                        u.name,
                        `Unlock: ${u.drinks.map((d) => d.name).join(", ")}`.slice(
                          0,
                          180,
                        ),
                      )
                    }
                  >
                    Add to shopping list +
                  </button>
                </article>
              ))}
            </div>
            <h3>Equipment to check</h3>
            <p className="bb-muted">
              These drinks have all ingredients, but still need a tool:
            </p>
            {results
              .filter((r) => !r.missing.length && r.tools.length)
              .map((r) => (
                <p key={r.drink.id}>
                  {r.drink.name}{" "}
                  <span className="bb-muted">
                    —{" "}
                    {r.tools
                      .map((id) => equipment.find((t) => t.id === id)?.name)
                      .join(", ")}
                  </span>
                </p>
              ))}
            {!results.some((r) => !r.missing.length && r.tools.length) && (
              <p className="bb-muted">
                No equipment-only blockers with these settings.
              </p>
            )}
          </>
        )}
        {tab === "My reviews" && (
          <>
            <div className="bb-section-title">
              <div>
                <p className="eyebrow">05 / Remember the good pours</p>
                <h2>Your tasting notes.</h2>
              </div>
              <span className="bb-muted">
                {profile.reviews.length} reviewed drinks
              </span>
            </div>
            <p className="bb-muted">
              Keep one editable review per cocktail. Pick any catalog drink,
              even if it isn’t currently makeable from your bar. Reviews are
              private to this browser and included in your backups.
            </p>
            <label className="bb-review-picker">
              Choose a drink to review
              <select
                aria-label="Drink to review"
                value={reviewDrink}
                onChange={(e) => setReviewDrink(e.target.value)}
              >
                {[...drinks]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </label>
            <ReviewEditor
              key={
                reviewDrink +
                (profile.reviews.find((r) => r.drinkId === reviewDrink)
                  ?.updatedAt ?? "")
              }
              drink={drinks.find((d) => d.id === reviewDrink)!}
              review={profile.reviews.find((r) => r.drinkId === reviewDrink)}
              onSave={(review) => {
                setProfile((p) => saveReview(p, review));
                setStatus("Review saved.");
              }}
            />
            <h3>Previously reviewed</h3>
            {!profile.reviews.length && (
              <div className="bb-empty">
                Your first review will appear here. Rate a drink above or use
                “Review this drink” on a cocktail card.
              </div>
            )}
            <div className="bb-review-list">
              {[...profile.reviews]
                .sort(
                  (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
                )
                .map((r) => (
                  <article className="bb-panel" key={r.drinkId}>
                    <h3>{drinks.find((d) => d.id === r.drinkId)?.name}</h3>
                    <p
                      className="bb-review-stars"
                      role="img"
                      aria-label={`${r.rating} out of 5 stars`}
                    >
                      {"★".repeat(r.rating)}
                      <span aria-hidden="true">{"☆".repeat(5 - r.rating)}</span>
                    </p>
                    {r.note && <p className="bb-review-note">{r.note}</p>}
                    <p className="bb-footnote">
                      Last updated {new Date(r.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="bb-actions">
                      <button
                        onClick={() => {
                          setReviewDrink(r.drinkId);
                          setStatus("Review selected above for editing.");
                        }}
                      >
                        Edit review
                      </button>
                      <button
                        className="bb-quiet"
                        onClick={() => {
                          setProfile((p) => ({
                            ...p,
                            reviews: p.reviews.filter(
                              (i) => i.drinkId !== r.drinkId,
                            ),
                          }));
                          setStatus("Review removed.");
                        }}
                      >
                        Remove review
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </>
        )}
        {tab === "Shopping list" && (
          <>
            <div className="bb-section-title">
              <div>
                <p className="eyebrow">04 / The next supply run</p>
                <h2>A little something for the bar.</h2>
              </div>
              <span className="bb-muted">{profile.shopping.length} items</span>
            </div>
            <label className="bb-retailer">
              Show shopping links
              <select
                value={retailer}
                onChange={(e) =>
                  setRetailer(e.target.value as Retailer | "All retailers")
                }
              >
                {["All retailers", ...retailers].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <p className="bb-muted">
              Links go directly to each retailer’s search results. After
              checking the product, size, and local stock, mark it available or
              unavailable below. These are your own checks, not a live stock
              feed.
            </p>
            <div className="bb-retailer-summary">
              {retailers.map((r) => {
                const summary = retailerSummary(profile.shopping, r);
                return (
                  <div className="bb-panel" key={r}>
                    <h3>{r}</h3>
                    <p className="bb-muted">
                      {summary.allConfirmed
                        ? `All ${summary.total} items marked available by you`
                        : `${summary.confirmed}/${summary.total} items marked available by you`}
                    </p>
                  </div>
                );
              })}
            </div>
            {!profile.shopping.length && (
              <div className="bb-empty">
                Your list is clear. Use restock in The bar, or discover a new
                ingredient in Unlock more.
              </div>
            )}
            {profile.shopping.map((s) => (
              <article
                className="bb-panel bb-shopping-item"
                key={s.ingredient + s.name}
              >
                <div>
                  <p className="eyebrow">{ingredientName(s.ingredient)}</p>
                  <h3>{s.name}</h3>
                  <p className="bb-muted">{s.reasons.join(" · ")}</p>
                  <label>
                    Size or shopping notes
                    <input
                      value={s.note}
                      maxLength={500}
                      placeholder="e.g. 750 ml, preferred brand…"
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          shopping: p.shopping.map((i) =>
                            i === s ? { ...i, note: e.target.value } : i,
                          ),
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="bb-shopping-actions">
                  {(retailer === "All retailers" ? retailers : [retailer]).map(
                    (r) => (
                      <div className="bb-store-check" key={r}>
                        <a
                          className="bb-button"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={searchURL(s.name + " " + s.note, r)}
                        >
                          Find at {r} ↗
                        </a>
                        <label>
                          Availability checked by you
                          <select
                            aria-label={`${r} availability for ${s.name}`}
                            value={s.retailerChecks?.[r]?.status ?? "unknown"}
                            onChange={(e) =>
                              setProfile((p) =>
                                checkRetailer(
                                  p,
                                  s,
                                  r,
                                  e.target.value as
                                    | "available"
                                    | "unavailable"
                                    | "unknown",
                                ),
                              )
                            }
                          >
                            <option value="unknown">Not checked</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </label>
                        {s.retailerChecks?.[r] && (
                          <small>
                            Checked{" "}
                            {new Date(
                              s.retailerChecks[r]!.checkedAt,
                            ).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    ),
                  )}
                  <button onClick={() => purchased(s)}>
                    Mark purchased (remove from my list)
                  </button>
                  <button
                    className="bb-quiet"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        shopping: p.shopping.filter((i) => i !== s),
                      }))
                    }
                  >
                    Remove from list
                  </button>
                </div>
              </article>
            ))}
            <p className="bb-footnote">
              Marking a purchase only updates your private shopping list. Nate
              can update the shared bar through chat after confirming purchases.
              Exact product-page links can be added when we verify brands and
              sizes together.
            </p>
          </>
        )}
      </section>
      <footer className="bb-footer">
        <span>BarBuddy / A cloudrouzan.com experiment</span>
        <span>Made for what’s on hand.</span>
      </footer>
    </main>
  );
}
function DrinkCard({
  drink,
  index,
  missing,
  missingTools,
  low,
  taste,
  onShop,
  review,
  onReview,
}: {
  drink: Drink;
  index: number;
  missing: string[];
  missingTools: string[];
  low: string[];
  taste: string;
  onShop: (id: string, name: string, reason: string) => void;
  review?: Review;
  onReview: () => void;
}) {
  const ready = !drink.needsReview && !missing.length && !missingTools.length;
  return (
    <article className="bb-drink">
      <div className={`bb-drink-image tone-${index % 3}`}>
        {drink.image ? (
          <img
            src={drink.image.src}
            alt={`${drink.name} cocktail`}
            loading="lazy"
            width="500"
            height="750"
          />
        ) : (
          <div aria-hidden="true">
            <div
              className={`bb-mini-glass ${drink.style === "Sparkling" ? "tall" : ""}`}
            >
              <div />
              <i />
            </div>
          </div>
        )}
        <span>{drink.style}</span>
      </div>
      <div className="bb-drink-body">
        <span className={`bb-pill ${ready ? "ready" : ""}`}>
          {drink.needsReview
            ? "Needs recipe verification"
            : ready
              ? "Ready to make"
              : missing.length
                ? `Missing ${missing.length} ${missing.length === 1 ? "ingredient" : "ingredients"}`
                : "Needs equipment"}
        </span>
        <h3>{drink.name}</h3>
        {review && (
          <p
            className="bb-review-stars"
            role="img"
            aria-label={`Your rating: ${review.rating} out of 5 stars`}
          >
            {"★".repeat(review.rating)}
            <span aria-hidden="true">{"☆".repeat(5 - review.rating)}</span>
          </p>
        )}
        <button className="bb-review-action" onClick={onReview}>
          {review ? "Edit your review" : "Review this drink"}
        </button>
        <p>{drink.description}</p>
        <p className="bb-match">
          {taste !== "Any" && drink.taste.includes(taste)
            ? `${taste} match · `
            : ""}
          {drink.effort} · {drink.taste.join(" / ")}
        </p>
        {missingTools.length > 0 && (
          <p className="bb-warning">
            Needs:{" "}
            {missingTools
              .map((id) => equipment.find((t) => t.id === id)?.name)
              .join(", ")}
          </p>
        )}
        {low.length > 0 && (
          <p className="bb-warning">
            Running low: {low.map(ingredientName).join(", ")}. Check quantities
            first.
          </p>
        )}
        <details className="bb-details">
          <summary>Ingredients & method</summary>
          <ul className="bb-recipe">
            {drink.needs.map((n) => (
              <li key={n.id}>
                <span>
                  {n.amount} {ingredientName(n.id)}
                  {missing.includes(n.id) && <small>Missing</small>}
                </span>
                {missing.includes(n.id) && (
                  <button
                    aria-label={`Shop ${ingredientName(n.id)} for ${drink.name}`}
                    onClick={() =>
                      onShop(n.id, ingredientName(n.id), `For ${drink.name}`)
                    }
                  >
                    +
                  </button>
                )}
              </li>
            ))}
          </ul>
          {drink.needsReview && (
            <p className="bb-warning">
              Preparation or quantity details need verification. This drink is
              excluded from make-now and unlock recommendations.
            </p>
          )}
          <p className="bb-method">{drink.method}</p>
          {!!drink.optionalNeeds?.length && (
            <p className="bb-footnote">
              Optional:{" "}
              {drink.optionalNeeds
                .map((n) => `${n.amount} ${ingredientName(n.id)}`)
                .join("; ")}
            </p>
          )}
          {drink.garnish && (
            <p className="bb-footnote">Garnish: {drink.garnish}</p>
          )}
          {drink.originalSource && (
            <p className="bb-footnote">
              Upstream reference: {drink.originalSource}
            </p>
          )}
          {drink.image && (
            <p className="bb-footnote">
              Photo:{" "}
              <a
                href={drink.image.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                {drink.image.author}
              </a>{" "}
              ·{" "}
              <a
                href={drink.image.licenseURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {drink.image.license}
              </a>
              . Resized and displayed cropped.
            </p>
          )}
          {drink.note && <p className="bb-footnote">{drink.note}</p>}
          {drink.source ? (
            <a href={drink.source} target="_blank" rel="noopener noreferrer">
              {drink.sourceLabel} ↗
            </a>
          ) : (
            <p className="bb-footnote">{drink.sourceLabel}</p>
          )}
        </details>
      </div>
    </article>
  );
}
