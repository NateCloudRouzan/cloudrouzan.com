import { useEffect, useRef, useState } from "react";
import {
  drinks,
  ingredients,
  ingredientName,
  equipment,
  products,
  type Drink,
} from "./catalog";
import {
  STORAGE_KEY,
  addInventory,
  productKey,
  setQuantity,
  isInInventory,
  MAX_QUANTITY,
  emptyProfile,
  defaultPreferences,
  parseProfile,
  ranked,
  unlocks,
  addShopping,
  searchURL,
  type Profile,
  type Stock,
  type ShoppingItem,
} from "./model";
import "./barbuddy.css";
const tabs = [
  "Find a drink",
  "My bar",
  "Unlock more",
  "Shopping list",
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
  const [query, setQuery] = useState("");
  const [newIngredient, setNewIngredient] = useState("gin");
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [offset, setOffset] = useState(0);
  const [retailer, setRetailer] = useState("Web");
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
  const results = ranked(profile, prefs);
  const ready = results.filter((r) => !r.missing.length && !r.tools.length);
  const suggestions = unlocks(profile, prefs);
  const view = showAll
    ? results
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
  function addItem(ingredient: string, name: string) {
    setProfile((p) => addInventory(p, ingredient, name, crypto.randomUUID()));
    setStatus(`${name} added to your bar.`);
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
      ...addInventory(p, item.ingredient, item.name, crypto.randomUUID()),
      shopping: p.shopping.filter((s) => s !== item),
    }));
    setStatus(`${item.name} confirmed purchased and marked available.`);
  }
  return (
    <main className="page bb">
      <header className="bb-top">
        <a href="/">
          cloudrouzan.com <span>/ projects</span>
        </a>
        <span className="bb-local">
          <i />{" "}
          {storageError ? "Local save needs attention" : "Saved on this device"}
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
            Your bar. Your taste. Your next cocktail.
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
              profile.items.filter(
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
            {!profile.items.length && (
              <div className="bb-notice">
                <strong>First, tell BarBuddy what’s on your shelf.</strong>
                <p>
                  Your inventory starts empty and stays in this browser. Add
                  your bottles, mixers, ice, and tools to see what’s ready.
                </p>
                <button className="bb-primary" onClick={() => setTab("My bar")}>
                  Set up my bar ↗
                </button>
              </div>
            )}
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
              <div className="bb-checks">
                {ingredients.map((i) => (
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
                      ? "Frozen recipes are coming"
                      : "A few possibilities"}
                </h3>
                <p>
                  {ready.length
                    ? `${ready.length} matching drinks. Flavor preferences bring your best matches to the top.`
                    : prefs.style === "Frozen"
                      ? "Ninja SLUSHi recipes will appear after model and formulation verification."
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
                    ? "Show suggestions"
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
                />
              ))}
            </div>
            <p className="bb-footnote">
              Recipes begin with IBA references and clearly labeled house
              proportions. Book recipes and page numbers are pending
              verification. Optional garnishes do not block a match.
            </p>
          </>
        )}
        {tab === "My bar" && (
          <>
            <div className="bb-section-title">
              <div>
                <p className="eyebrow">02 / Take stock</p>
                <h2>Good things on your shelf.</h2>
              </div>
              <span className="bb-muted">Only you, in this browser.</span>
            </div>
            <div className="bb-notice">
              Confirm the ingredient category when adding a product. Flavored
              spirits, premixes, and different bitters are kept separate. No
              quantities are inferred from photos.
            </div>
            <div className="bb-bar-layout">
              <section className="bb-panel">
                <h3>Add to your bar</h3>
                <label>
                  Search products or ingredients
                  <input
                    type="search"
                    placeholder="Try Chambord, gin, or lime…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <div className="bb-directory">
                  {[
                    ...products.map((p) => ({
                      name: p.name,
                      ingredient: p.ingredient,
                    })),
                    ...ingredients
                      .filter(
                        (i) =>
                          !products.some(
                            (p) =>
                              p.name.toLowerCase() === i.name.toLowerCase() &&
                              p.ingredient === i.id,
                          ),
                      )
                      .map((i) => ({ name: i.name, ingredient: i.id })),
                  ]
                    .filter(
                      (p) => !isInInventory(profile, p.ingredient, p.name),
                    )
                    .filter((p) =>
                      (p.name + " " + ingredientName(p.ingredient))
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((p, i) => (
                      <div key={p.name + i}>
                        <span>
                          {p.name}
                          <small>{ingredientName(p.ingredient)}</small>
                        </span>
                        <button
                          aria-label={`Add ${p.name}`}
                          onClick={() => addItem(p.ingredient, p.name)}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                </div>
                <details className="bb-details">
                  <summary>Add another brand or product</summary>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newName.trim()) {
                        addItem(newIngredient, newName.trim());
                        setNewName("");
                      }
                    }}
                  >
                    <label>
                      Product name
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        maxLength={180}
                        placeholder="Your bottle or ingredient"
                      />
                    </label>
                    <label>
                      Ingredient category
                      <select
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                      >
                        {ingredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="bb-primary" type="submit">
                      Add product
                    </button>
                  </form>
                </details>
              </section>
              <section className="bb-panel">
                <h3>
                  My inventory{" "}
                  <span className="bb-muted">/ {profile.items.length}</span>
                </h3>
                {!profile.items.length && (
                  <p className="bb-muted">
                    Add your first item from the directory. Remember ice and
                    other essentials.
                  </p>
                )}
                <p className="bb-footnote">
                  Update counts here instead of adding another row. Zero marks
                  an item out; use Restock to buy more.
                </p>
                <div className="bb-inventory">
                  {profile.items.map((item) => (
                    <div className="bb-stock-row" key={item.id}>
                      <div className="bb-stock-label">
                        {item.name}
                        <small>{ingredientName(item.ingredient)}</small>
                        <input
                          aria-label={`Edit product name for ${item.name}`}
                          defaultValue={item.name}
                          maxLength={180}
                          onBlur={(e) => {
                            const name = e.currentTarget.value.trim();
                            if (name) {
                              if (
                                profile.items.some(
                                  (i) =>
                                    i.id !== item.id &&
                                    productKey(i.ingredient, i.name) ===
                                      productKey(item.ingredient, name),
                                )
                              ) {
                                e.currentTarget.value = item.name;
                                setStatus(
                                  "That product is already in your bar. Update its quantity instead.",
                                );
                              } else {
                                setProfile((p) => ({
                                  ...p,
                                  items: p.items.map((i) =>
                                    i.id === item.id ? { ...i, name } : i,
                                  ),
                                }));
                              }
                            } else {
                              e.currentTarget.value = item.name;
                              setStatus("Product names cannot be empty.");
                            }
                          }}
                        />
                        <label className="bb-quantity">
                          Quantity (bottles / items)
                          <input
                            key={item.quantity}
                            type="number"
                            min="0"
                            max={MAX_QUANTITY}
                            step="1"
                            defaultValue={item.quantity}
                            aria-label={`${item.name} quantity`}
                            onBlur={(e) => {
                              const value = e.currentTarget.value;
                              const quantity = Number(value);
                              if (
                                value.trim() &&
                                Number.isSafeInteger(quantity) &&
                                quantity >= 0 &&
                                quantity <= MAX_QUANTITY
                              ) {
                                setProfile((p) => ({
                                  ...p,
                                  items: p.items.map((i) =>
                                    i.id === item.id
                                      ? setQuantity(i, quantity)
                                      : i,
                                  ),
                                }));
                              } else {
                                e.currentTarget.value = String(item.quantity);
                                setStatus(
                                  "Quantity must be a whole number from 0 to 9999.",
                                );
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                          />
                        </label>
                        <select
                          aria-label={`${item.name} availability`}
                          value={item.stock}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              items: p.items.map((i) =>
                                i.id === item.id
                                  ? {
                                      ...i,
                                      stock: e.target.value as Stock,
                                      quantity:
                                        e.target.value === "out"
                                          ? 0
                                          : Math.max(1, i.quantity),
                                    }
                                  : i,
                              ),
                            }))
                          }
                        >
                          {[
                            ["have", "Have it"],
                            ["low", "Running low"],
                            ["out", "Out"],
                            ["unknown", "Unknown"],
                          ].map(([v, n]) => (
                            <option key={v} value={v}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="bb-actions">
                        <a
                          href={searchURL(item.name, retailer)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Find product ↗
                        </a>
                        <button
                          onClick={() =>
                            shop(item.ingredient, item.name, "Restock")
                          }
                        >
                          Restock
                        </button>
                        <button
                          className="bb-quiet"
                          aria-label={`Remove ${item.name}`}
                          onClick={() =>
                            setProfile((p) => ({
                              ...p,
                              items: p.items.filter((i) => i.id !== item.id),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <section className="bb-panel bb-equipment">
              <h3>Tools of the trade</h3>
              <p className="bb-muted">
                Select what you have. A carbonator doesn’t automatically add
                sparkling water—confirm it in your inventory when ready.
              </p>
              <div className="bb-checks">
                {equipment.map((t) => (
                  <label key={t.id}>
                    <input
                      type="checkbox"
                      checked={profile.tools.includes(t.id)}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          tools: e.target.checked
                            ? [...p.tools, t.id]
                            : p.tools.filter((id) => id !== t.id),
                        }))
                      }
                    />
                    {t.name}
                  </label>
                ))}
              </div>
              <p className="bb-footnote">
                SLUSHi ownership is recorded now; frozen variants need
                model-specific verification before use.
              </p>
            </section>
            <section className="bb-panel">
              <h3>Keep a backup</h3>
              <p className="bb-muted">
                Your bar is saved on this browser only. Export to move it to
                another device. Imports replace the current inventory,
                equipment, and shopping list after confirmation.
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
                  <strong>Replace with imported backup?</strong>
                  <p>
                    {pending.items.length} inventory items ·{" "}
                    {pending.tools.length} tools · {pending.shopping.length}{" "}
                    shopping items. Export your current bar first if you want to
                    keep it.
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
                      Replace current bar
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
                No single-ingredient unlocks yet. Add your stock and tools in My
                bar, or loosen your preferences in Find a drink.
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
              Search preference
              <select
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
              >
                {["Web", "Total Wine", "BevMo", "Instacart", "Amazon"].map(
                  (r) => (
                    <option key={r}>{r}</option>
                  ),
                )}
              </select>
            </label>
            <p className="bb-muted">
              Links open a web search for the product and your selected
              retailer. Choose a result, verify the size and availability, and
              add it to that retailer’s cart. No live prices or direct-cart
              integration.
            </p>
            {!profile.shopping.length && (
              <div className="bb-empty">
                Your list is clear. Use Restock in My bar, or discover a new
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
                  <a
                    className="bb-button bb-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={searchURL(s.name + " " + s.note, retailer)}
                  >
                    Search {retailer === "Web" ? "the web" : retailer} ↗
                  </a>
                  <button onClick={() => purchased(s)}>
                    Confirm purchased & add to bar
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
              Confirm purchased adds one to this product’s quantity and marks it
              available. For a generic ingredient, add the exact brand
              separately in My bar if you want a precise restock search next
              time.
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
}: {
  drink: Drink;
  index: number;
  missing: string[];
  missingTools: string[];
  low: string[];
  taste: string;
  onShop: (id: string, name: string, reason: string) => void;
}) {
  const ready = !missing.length && !missingTools.length;
  return (
    <article className="bb-drink">
      <div className={`bb-drink-image tone-${index % 3}`} aria-hidden="true">
        <div
          className={`bb-mini-glass ${drink.style === "Sparkling" ? "tall" : ""}`}
        >
          <div />
          <i />
        </div>
        <span>{drink.style}</span>
      </div>
      <div className="bb-drink-body">
        <span className={`bb-pill ${ready ? "ready" : ""}`}>
          {ready
            ? "Ready to make"
            : missing.length
              ? `Missing ${missing.length} ${missing.length === 1 ? "ingredient" : "ingredients"}`
              : "Needs equipment"}
        </span>
        <h3>{drink.name}</h3>
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
          <p>{drink.method}</p>
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
