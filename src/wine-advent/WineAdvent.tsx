import { useEffect, useState, type FormEvent } from "react";
import { cardNotes } from "./card-notes";
import { pantryIds, pantryWines } from "./pantry-wines";
import "./wine-advent.css";

const players = ["Nate", "Hallie"] as const;
type Player = typeof players[number];
type Guess = { major: string; minor: string[] };
type Review = { rating: number; note: string };
type Reveal = { wine: string; major: string; minor: string; bottle: string };
type Matches = { major: boolean; minor: boolean[] };
type Round = {
  guesses: Partial<Record<Player, Guess>>;
  reveal?: Reveal;
  matches?: Record<Player, Matches>;
  sharedReview?: Review;
  reviewWineName?: string;
  reviews?: Partial<Record<Player, Review>>;
};

const days = Array.from({ length: 24 }, (_, index) => index + 1);
const lastCalendarDay = days.length;
const storageKey = "cloudrouzan.wine-advent.v1";
const pantryBottle = (product: string) => `https://www.firstleaf.com/products/${product}`;
const emptyRound: Round = { guesses: {} };
const normalize = (value: string) => value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const notes = (value: string) => value.split(",").map(note => note.trim()).filter(Boolean);
const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim();

function reviewForRound(round: Round): Review | undefined {
  if (round.sharedReview) return round.sharedReview;
  const previous = players.flatMap(player => {
    const review = round.reviews?.[player];
    return review ? [{ player, ...review }] : [];
  });
  if (!previous.length) return;
  const totalTenths = previous.reduce((sum, review) => sum + Math.round(review.rating * 10), 0);
  return {
    rating: Math.round(totalTenths / previous.length) / 10,
    note: previous.filter(review => review.note).map(review => `${review.player}: ${review.note}`).join("\n\n"),
  };
}

type Rounds = Partial<Record<number, Round>>;

function readRounds(): Rounds {
  const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function loadRounds(): Rounds {
  try {
    return readRounds();
  } catch {
    return {};
  }
}

export default function WineAdvent() {
  const reviewOnly = new URLSearchParams(window.location.search).get("mode") === "review";
  const [rounds, setRounds] = useState(loadRounds);
  const [day, setDay] = useState(() => days.find(number => !rounds[number]?.matches) ?? 1);
  const [storageError, setStorageError] = useState(false);
  const round = rounds[day] ?? emptyRound;
  const knownWineName = round.reveal?.wine ?? pantryWines[day]?.name;
  useEffect(() => {
    function refresh(event: StorageEvent) {
      if (event.storageArea === localStorage && (event.key === storageKey || event.key === null)) {
        setRounds(loadRounds());
      }
    }
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function saveRound(number: number | undefined, changes: Partial<Round>) {
    try {
      const latest = readRounds();
      const target = number ?? Math.max(lastCalendarDay, ...Object.keys(latest).map(Number).filter(Number.isSafeInteger)) + 1;
      // Apply only the fields this action changed so an older tab cannot erase a saved review.
      const updated = { ...latest, [target]: { ...(latest[target] ?? emptyRound), ...changes } };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setRounds(updated);
      setStorageError(false);
      return target;
    } catch {
      setStorageError(true);
      return undefined;
    }
  }

  const extraRounds = Object.keys(rounds).map(Number).filter(number => Number.isSafeInteger(number) && number > lastCalendarDay);
  const homeRounds = [...pantryIds, ...extraRounds];
  const allRounds = [...days, ...homeRounds];
  const played = allRounds.filter(number => rounds[number]?.matches);
  const calendarPlayed = days.filter(number => rounds[number]?.matches).length;
  const isExtra = day < 0 || day > lastCalendarDay;
  const extraLabel = (number: number) => pantryWines[number]?.name ?? `Home round ${number - lastCalendarDay}`;
  const openRound = (number: number) => {
    setDay(number);
    document.getElementById("wa-round")?.scrollIntoView({ block: "start" });
  };
  const rankings = allRounds.flatMap(number => {
    const entry = rounds[number];
    if (!entry) return [];
    const pantryWine = pantryWines[number];
    const wine = entry.reveal?.wine ?? pantryWine?.name ?? entry.reviewWineName;
    const review = reviewForRound(entry);
    if (!wine || !review) return [];
    const bottle = entry.reveal?.bottle ?? (pantryWine ? pantryBottle(pantryWine.product) : "");
    return [{ day: number, wine, bottle, rating: review.rating, note: review.note }];
  }).sort((a, b) => b.rating - a.rating || a.day - b.day);

  return (
    <main className="wa">
      <div className="wa-shell">
        <nav>
          <a href="/">cloudrouzan.com</a>
          <a href={reviewOnly ? "/WineAdvent/" : "/WineAdvent/?mode=review"}>{reviewOnly ? "Guessing game" : "Review only"}</a>
          <a href="#wine-rankings">Bottle rankings</a>
        </nav>
        <header className="wa-hero">
          <p className="wa-kicker">In Good Taste · 24 doors</p>
          <h1>Wine Advent</h1>
          <p>{reviewOnly ? "Wine reviews for Nate & Hallie." : "A blind tasting game for Nate & Hallie."}</p>
        </header>
        {storageError && <p role="alert">This browser couldn’t save your changes. Leave this tab open and try saving again.</p>}
        <div className="wa-layout">
          <aside>
            <section className="wa-panel" aria-labelledby="wa-calendar">
              <h2 id="wa-calendar">The calendar</h2>
              {!reviewOnly && <p className="wa-muted">{calendarPlayed} of 24 doors scored</p>}
              <div className="wa-days">
                {days.map(number => (
                  <button key={number} type="button" aria-pressed={day === number}
                    aria-label={`Door ${number}${reviewOnly ? (rounds[number] && reviewForRound(rounds[number]!) ? ", reviewed" : "") : rounds[number]?.matches ? ", scored" : rounds[number] ? ", in progress" : ""}`}
                    className={rounds[number]?.matches ? "wa-scored" : ""}
                    onClick={() => reviewOnly ? openRound(number) : setDay(number)}>{number}</button>
                ))}
              </div>
            </section>
            <section className="wa-panel" aria-labelledby="wa-home-wines">
              <h2 id="wa-home-wines">Wines at home</h2>
              {homeRounds.length > 0 && (
                <ul className="wa-extra-rounds">
                  {homeRounds.map(number => (
                    <li key={number}>
                      <button type="button" aria-pressed={day === number} onClick={() => openRound(number)}>
                        {rounds[number]?.reveal?.wine ?? rounds[number]?.reviewWineName ?? extraLabel(number)}
                        {!reviewOnly && rounds[number]?.matches && <span className="wa-muted"> · Scored</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={() => {
                const number = saveRound(undefined, { guesses: {} });
                if (number !== undefined) openRound(number);
              }}>{reviewOnly ? "Add a wine to review" : "Add a wine round"}</button>
            </section>
            {!reviewOnly && <section className="wa-panel">
              <h2>Scoreboard</h2>
              <table>
                <thead><tr><th scope="col">Player</th><th scope="col">Major</th><th scope="col">Minor</th><th scope="col">Pts</th></tr></thead>
                <tbody>{players.map(player => {
                  const matches = played.map(number => rounds[number]!.matches![player]);
                  const major = matches.filter(match => match.major).length;
                  const minor = matches.reduce((sum, match) => sum + match.minor.filter(Boolean).length, 0);
                  return <tr key={player}><th scope="row">{player}</th><td>{major}</td><td>{minor}</td><td>{major * 2 + minor}</td></tr>;
                })}</tbody>
              </table>
              <p className="wa-muted">Major notes earn 2 points. Each minor note earns 1.</p>
            </section>}
          </aside>
          <section className="wa-panel wa-round" id="wa-round" aria-labelledby="wa-door">
            <p className="wa-kicker">{isExtra ? extraLabel(day) : `Door ${String(day).padStart(2, "0")}`}</p>
            <h2 id="wa-door">{reviewOnly ? knownWineName ?? "Review together" : round.reveal?.wine ?? "The blind pour"}</h2>
            {reviewOnly ? (
              <ReviewForm key={day} review={reviewForRound(round)}
                wineName={knownWineName ? undefined : round.reviewWineName ?? ""}
                save={(sharedReview, wineName) => saveRound(day, knownWineName ? { sharedReview } : { sharedReview, reviewWineName: wineName })} />
            ) : (
              <RoundContent key={day} round={round} day={day} update={next => saveRound(day, next)} />
            )}
          </section>
        </div>
        <section className="wa-panel wa-rankings" id="wine-rankings">
          <h2>Bottle power rankings</h2>
          <p className="wa-muted">Sorted by your shared rating. Wines enter the ranking after their first review.</p>
          {rankings.length ? <ol>{rankings.map(entry => (
            <li key={entry.day}>
              <button type="button" onClick={() => openRound(entry.day)}>{entry.wine}</button>
              <strong>{entry.rating.toFixed(1)} / 10</strong>
              <BottleLink wine={entry.wine} bottle={entry.bottle} isExtra={entry.day < 0 || entry.day > lastCalendarDay} />
              {entry.note && <p className="wa-review-note">{entry.note}</p>}
            </li>
          ))}</ol> : <p>Save a review to put your first wine on the board.</p>}
        </section>
        <p className="wa-footer">Play together on the same device. Guesses, scores, and reviews are saved in this browser.</p>
      </div>
    </main>
  );
}

function RoundContent({ round, day, update }: { round: Round; day: number; update: (changes: Partial<Round>) => number | undefined }) {
  const isExtra = day < 0 || day > lastCalendarDay;
  const pantryWine = pantryWines[day];
  const nextPlayer = players.find(player => !round.guesses[player]);
  if (nextPlayer) {
    return <GuessForm key={nextPlayer} player={nextPlayer} noteCount={(pantryWine?.notes ?? cardNotes[day])?.length} includePantry={isExtra}
      lock={guess => update({ guesses: { ...round.guesses, [nextPlayer]: guess } })} />;
  }

  if (!round.reveal) {
    if (pantryWine) {
      const [major, ...minor] = pantryWine.notes;
      return <>
        <h3>Both guesses are locked</h3>
        <button className="wa-primary" type="button" onClick={() => update({
          reveal: { wine: pantryWine.name, major, minor: minor.join(", "), bottle: pantryBottle(pantryWine.product) },
        })}>Reveal the wine</button>
      </>;
    }
    const reference = cardNotes[day];
    return (
      <form onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const wine = field(data, "wine");
        const major = reference?.[0] ?? field(data, "major");
        const minor = reference ? reference.slice(1).join(", ") : field(data, "minor");
        if (!wine || !major) return;
        update({ reveal: { wine, major, minor, bottle: "" } });
      }}>
        <h3>Both guesses are locked</h3>
        {reference ? (
          <p>Enter the name printed on the mini bottle, then reveal the tasting notes from the calendar card.</p>
        ) : (
          <p>Check the bottle label or look up the winery’s tasting notes. Use its lead flavor as the major note and its supporting flavors as minor notes.</p>
        )}
        <label>Wine name and vintage<input name="wine" required maxLength={140} defaultValue={round.reviewWineName} /></label>
        {!reference && (
          <>
            <label>Official major note<input name="major" required maxLength={100} /></label>
            <label>Official minor notes<input name="minor" maxLength={280} placeholder="Separate notes with a comma" /></label>
          </>
        )}
        <button className="wa-primary" type="submit">Reveal the wine</button>
      </form>
    );
  }

  const reveal = round.reveal;
  return (
    <>
      {pantryWine && (
        <div>
          <p>{pantryWine.region} · {pantryWine.retailPrice} listed retail</p>
          <p>{pantryWine.description}</p>
          <p><strong>Pairs well with</strong> {pantryWine.pairings}</p>
        </div>
      )}
      <dl className="wa-notes">
        <div><dt>Major note</dt><dd>{reveal.major}</dd></div>
        <div><dt>Minor notes</dt><dd>{reveal.minor || "None recorded"}</dd></div>
      </dl>
      <form onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const readMatches = (player: Player): Matches => ({
          major: data.has(`${player}-major`),
          minor: round.guesses[player]!.minor.map((_, index) => data.has(`${player}-minor-${index}`)),
        });
        update({ matches: { Nate: readMatches("Nate"), Hallie: readMatches("Hallie") } });
      }}>
        <h3>Score the guesses</h3>
        <p className="wa-muted">Exact matches start checked. Adjust for synonyms and give each official note credit once per player.</p>
        <div className="wa-pair">
          {players.map(player => {
            const guess = round.guesses[player]!;
            const saved = round.matches?.[player];
            return <fieldset key={player}>
              <legend>{player}</legend>
              <label className="wa-check"><input type="checkbox" name={`${player}-major`} defaultChecked={saved?.major ?? (normalize(guess.major) === normalize(reveal.major))} /> Major · {guess.major}</label>
              {guess.minor.map((note, index) => <label className="wa-check" key={note}>
                <input type="checkbox" name={`${player}-minor-${index}`} defaultChecked={saved?.minor[index] ?? notes(reveal.minor).some(answer => normalize(answer) === normalize(note))} /> Minor · {note}
              </label>)}
            </fieldset>;
          })}
        </div>
        <button className="wa-primary" type="submit">{round.matches ? "Update scores" : "Save scores"}</button>
        {round.matches && <span className="wa-saved" role="status">Scored</span>}
      </form>
      <h3>Review together</h3>
      <ReviewForm review={reviewForRound(round)} save={sharedReview => update({ sharedReview })} />
      <form className="wa-bottle" onSubmit={event => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem("bottle") as HTMLInputElement;
        const bottle = input.value.trim();
        if (bottle && !/^https?:\/\//i.test(bottle)) {
          input.setCustomValidity("Enter a web address beginning with https:// or http://.");
          input.reportValidity();
          return;
        }
        update({ reveal: { ...reveal, bottle } });
      }}>
        <BottleLink wine={reveal.wine} bottle={reveal.bottle} isExtra={isExtra} />
        <label>Full-bottle link (optional)
          <input type="url" name="bottle" defaultValue={reveal.bottle} maxLength={2048}
            onChange={event => event.currentTarget.setCustomValidity("")} placeholder="https://…" />
        </label>
        <button type="submit">Save bottle link</button>
      </form>
    </>
  );
}

const flavorLabels = new Map(Object.values(cardNotes).flatMap(entry =>
  (entry ?? []).map(note => [normalize(note), note.toLowerCase()] as const)));
const pantryFlavorLabels = new Map(Object.values(pantryWines).flatMap(wine =>
  (wine?.notes ?? []).map(note => [normalize(note), note.toLowerCase()] as const)));
const homeFlavorLabels = new Map([...flavorLabels, ...pantryFlavorLabels]);
const flavorChoices = [...homeFlavorLabels.values()].sort((a, b) => a.localeCompare(b));
const flavorGroups = [
  { label: "Citrus", flavors: ["citrus", "citrus zest", "grapefruit", "lemon", "lime"] },
  { label: "Berries", flavors: ["black currant", "blackberry", "blackberry preserves", "cranberry", "juicy berries", "raspberry", "strawberry"] },
  { label: "Orchard & stone fruit", flavors: ["black cherry", "black plum", "dark cherry", "golden apple", "green apple", "plum", "red cherry", "red plum", "ripe peach", "ripe pear", "ripe plum", "sour cherry", "white peach"] },
  { label: "Tropical fruit & melon", flavors: ["passionfruit", "pineapple", "watermelon"] },
  { label: "Floral", flavors: ["chamomile", "citrus blossom", "honeysuckle", "lavender", "rose petal"] },
  { label: "Herbs & greens", flavors: ["dried herbs", "fresh herbs", "fresh tomato leaf", "fresh-cut grass", "jalapeño"] },
  { label: "Spices", flavors: ["baking spice", "clove", "cracked peppercorn", "licorice", "spice", "vanilla bean", "white pepper"] },
  { label: "Chocolate, toast & honey", flavors: ["beeswax", "brioche", "cocoa", "cocoa powder", "dark chocolate", "honeycomb", "toast"] },
  { label: "Earth, wood & minerals", flavors: ["cedar", "char", "cigar box", "forest floor", "leather", "mineral", "sea spray", "wet stone"] },
].map(({ label, flavors }) => ({ label, flavors: flavorChoices.filter(note => flavors.includes(note)) }));
const groupedFlavors = new Set(flavorGroups.flatMap(group => group.flavors));


function GuessForm({ player, noteCount, includePantry, lock }: { player: Player; noteCount?: number; includePantry: boolean; lock: (guess: Guess) => void }) {
  const limit = noteCount ?? 3;
  const [selected, setSelected] = useState<string[]>([]);
  const [major, setMajor] = useState("");
  const [custom, setCustom] = useState("");
  const atLimit = selected.length >= limit;
  const majorNote = selected.includes(major) ? major : selected[0];
  const customNote = custom.trim();
  const customKey = normalize(customNote);
  const labels = includePantry ? homeFlavorLabels : flavorLabels;
  const otherFlavors = [...flavorChoices.filter(note => labels.has(normalize(note)) && !groupedFlavors.has(note)),
    ...selected.filter(note => !labels.has(normalize(note)))];
  const groups = [...flavorGroups.map(group => ({ ...group, flavors: group.flavors.filter(note => labels.has(normalize(note))) })),
    { label: "Other flavors", flavors: otherFlavors }];

  return (
    <form onSubmit={event => {
      event.preventDefault();
      if (majorNote) lock({ major: majorNote, minor: selected.filter(note => note !== majorNote) });
    }}>
      <h3>{player}’s turn</h3>
      <p>{player === "Nate" ? "Taste the wine before checking the bottle or guide." : "Nate’s guesses are locked. Hand the device to Hallie."}</p>
      <fieldset className="wa-flavor-picker">
        <legend>Choose tasting notes</legend>
        <p className="wa-muted">{noteCount ? `The tasting sheet lists ${noteCount} notes for this wine.` : `Choose up to ${limit} notes.`}</p>
        <p className="wa-saved" role="status">{selected.length} of {limit} selected</p>
        <div className="wa-flavor-groups">
          {groups.filter(group => group.flavors.length).map(group => (
            <div className="wa-flavor-group" role="group" aria-label={group.label} key={group.label}>
              <h4>{group.label}</h4>
              <div className="wa-flavors">
                {group.flavors.map(note => {
                  const chosen = selected.includes(note);
                  return <button key={note} type="button" aria-pressed={chosen} disabled={!chosen && atLimit}
                    onClick={() => {
                      if (chosen) {
                        setSelected(selected.filter(value => value !== note));
                        if (major === note) setMajor("");
                      } else {
                        setSelected([...selected, note]);
                      }
                    }}>{note}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
        {!noteCount && (
          <div className="wa-custom-note">
            <label>Other flavor<input value={custom} maxLength={80} onChange={event => setCustom(event.currentTarget.value)}
              onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }} /></label>
            <button type="button" disabled={!customKey || atLimit || selected.some(note => normalize(note) === customKey)}
              onClick={() => {
                setSelected([...selected, labels.get(customKey) ?? customNote]);
                setCustom("");
              }}>Add flavor</button>
          </div>
        )}
      </fieldset>
      {majorNote && (
        <label>Major note
          <select value={majorNote} onChange={event => setMajor(event.currentTarget.value)}>
            {selected.map(note => <option key={note} value={note}>{note}</option>)}
          </select>
        </label>
      )}
      <button className="wa-primary" type="submit" disabled={!majorNote}>Lock {player}’s guesses</button>
    </form>
  );
}

function BottleLink({ wine, bottle, isExtra }: { wine: string; bottle: string; isExtra: boolean }) {
  const query = encodeURIComponent(`${wine} 750ml`);
  const search = isExtra ? `https://www.google.com/search?q=${query}` : `https://ingoodtaste.com/search?q=${query}`;
  const searchLabel = isExtra ? "Search for a full bottle" : "Search In Good Taste for 750 ml";
  const direct = /^https?:\/\//i.test(bottle);
  return <a href={direct ? bottle : search} target="_blank" rel="noreferrer">{direct ? "View full bottle" : searchLabel}</a>;
}

function ReviewForm({ review, wineName, save }: { review?: Review; wineName?: string; save: (review: Review, wineName: string) => number | undefined }) {
  const [draft, setDraft] = useState<{ rating: string; note: string; wine: string }>();
  const fields = draft ?? { rating: review?.rating.toFixed(1) ?? "", note: review?.note ?? "", wine: wineName ?? "" };
  return <form onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rating = Number(field(data, "rating"));
    if (rating < 1 || rating > 10 || !Number.isInteger(rating * 10)) return;
    const wine = field(data, "wine");
    if (wineName !== undefined && !wine) return;
    if (save({ rating, note: field(data, "note") }, wine) !== undefined) setDraft(undefined);
  }}>
    <fieldset>
      <legend>Nate &amp; Hallie</legend>
      {wineName !== undefined && <label>Wine name and vintage
        <input name="wine" required maxLength={140} value={fields.wine} onChange={event => setDraft({ ...fields, wine: event.currentTarget.value })} />
      </label>}
      <label>Rating (1.0–10.0)<input type="number" name="rating" min="1" max="10" step="0.1" required value={fields.rating} onChange={event => setDraft({ ...fields, rating: event.currentTarget.value })} /></label>
      <label>Tasting note (optional)<textarea name="note" rows={3} maxLength={2100} value={fields.note} onChange={event => setDraft({ ...fields, note: event.currentTarget.value })} /></label>
      <button type="submit">Save shared review</button>
      <p className="wa-saved" role="status">{!draft && review ? `Saved ${review.rating.toFixed(1)} / 10` : ""}</p>
    </fieldset>
  </form>;
}
