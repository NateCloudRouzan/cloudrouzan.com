import { useState, type FormEvent } from "react";
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
  reviews?: Partial<Record<Player, Review>>;
};

const days = Array.from({ length: 24 }, (_, index) => index + 1);
const storageKey = "cloudrouzan.wine-advent.v1";
const guide = "https://ingoodtaste.com/pages/advent-experience";
const emptyRound: Round = { guesses: {} };
const normalize = (value: string) => value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const notes = (value: string) => value.split(",").map(note => note.trim()).filter(Boolean);
const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim();

function loadRounds(): Partial<Record<number, Round>> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

export default function WineAdvent() {
  const [rounds, setRounds] = useState(loadRounds);
  const [day, setDay] = useState(() => days.find(number => !rounds[number]?.matches) ?? 1);
  const [storageError, setStorageError] = useState(false);
  const round = rounds[day] ?? emptyRound;
  const update = (next: Round) => {
    const updated = { ...rounds, [day]: next };
    setRounds(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };

  const played = days.filter(number => rounds[number]?.matches);
  const rankings = days.flatMap(number => {
    const entry = rounds[number];
    if (!entry?.reveal || !entry.reviews) return [];
    const ratings = players.flatMap(player => entry.reviews?.[player]?.rating ?? []);
    if (!ratings.length) return [];
    return [{ day: number, wine: entry.reveal.wine, bottle: entry.reveal.bottle, count: ratings.length,
      average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length }];
  }).sort((a, b) => b.average - a.average || a.day - b.day);

  return (
    <main className="wa">
      <div className="wa-shell">
        <nav><a href="/">cloudrouzan.com</a><a href="#wine-rankings">Bottle rankings</a></nav>
        <header className="wa-hero">
          <p className="wa-kicker">In Good Taste · 24 doors</p>
          <h1>Wine Advent</h1>
          <p>A blind tasting game for Nate &amp; Hallie.</p>
        </header>
        {storageError && <p role="alert">This browser couldn’t save your progress. Keep this tab open to retain it.</p>}
        <div className="wa-layout">
          <aside>
            <section className="wa-panel" aria-labelledby="wa-calendar">
              <h2 id="wa-calendar">The calendar</h2>
              <p className="wa-muted">{played.length} of 24 rounds scored</p>
              <div className="wa-days">
                {days.map(number => (
                  <button key={number} type="button" aria-pressed={day === number}
                    aria-label={`Door ${number}${rounds[number]?.matches ? ", scored" : rounds[number] ? ", in progress" : ""}`}
                    className={rounds[number]?.matches ? "wa-scored" : ""}
                    onClick={() => setDay(number)}>{number}</button>
                ))}
              </div>
            </section>
            <section className="wa-panel">
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
            </section>
          </aside>
          <section className="wa-panel wa-round" key={day} aria-labelledby="wa-door">
            <p className="wa-kicker">Door {String(day).padStart(2, "0")}</p>
            <h2 id="wa-door">{round.reveal?.wine ?? "The blind pour"}</h2>
            <RoundContent round={round} update={update} />
          </section>
        </div>
        <section className="wa-panel wa-rankings" id="wine-rankings">
          <h2>Bottle power rankings</h2>
          <p className="wa-muted">Sorted by average rating. Wines enter the ranking after their first review.</p>
          {rankings.length ? <ol>{rankings.map(entry => (
            <li key={entry.day}>
              <button type="button" onClick={() => {
                setDay(entry.day);
                document.getElementById("wa-door")?.scrollIntoView({ block: "center" });
              }}>{entry.wine}</button>
              <strong>{entry.average.toFixed(1)} / 10</strong>
              <span className="wa-muted">{entry.count}/2 ratings</span>
              <BottleLink wine={entry.wine} bottle={entry.bottle} />
            </li>
          ))}</ol> : <p>Save a review to put your first wine on the board.</p>}
        </section>
        <p className="wa-footer">Play together on the same device. Guesses, scores, and reviews are saved in this browser.</p>
      </div>
    </main>
  );
}

function RoundContent({ round, update }: { round: Round; update: (next: Round) => void }) {
  const nextPlayer = players.find(player => !round.guesses[player]);
  if (nextPlayer) {
    function lock(event: FormEvent<HTMLFormElement>, player: Player) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const major = field(data, "major");
      const minor = ["minor-1", "minor-2"].map(name => field(data, name))
        .filter(note => note && normalize(note) !== normalize(major));
      if (!major) return;
      const unique = [...new Map(minor.map(note => [normalize(note), note])).values()];
      update({ ...round, guesses: { ...round.guesses, [player]: { major, minor: unique } } });
    }
    return (
      <form key={nextPlayer} onSubmit={event => lock(event, nextPlayer)}>
        <h3>{nextPlayer}’s turn</h3>
        <p>{nextPlayer === "Nate" ? "Taste the wine before checking the bottle or guide." : "Nate’s guesses are locked. Hand the device to Hallie."}</p>
        <label>Major note<input name="major" required maxLength={80} placeholder="The flavor that stands out most" /></label>
        <div className="wa-pair">
          <label>First minor note<input name="minor-1" maxLength={80} placeholder="Optional" /></label>
          <label>Second minor note<input name="minor-2" maxLength={80} placeholder="Optional" /></label>
        </div>
        <button className="wa-primary" type="submit">Lock {nextPlayer}’s guesses</button>
      </form>
    );
  }

  if (!round.reveal) {
    return (
      <form onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const wine = field(data, "wine");
        const major = field(data, "major");
        if (!wine || !major) return;
        update({ ...round, reveal: { wine, major, minor: field(data, "minor"), bottle: "" } });
      }}>
        <h3>Both guesses are locked</h3>
        <p>Open the bottle’s tasting guide. Use its lead flavor as the major note and its supporting flavors as minor notes.</p>
        <a href={guide} target="_blank" rel="noreferrer">Open the In Good Taste guide</a>
        <label>Wine name and vintage<input name="wine" required maxLength={140} /></label>
        <label>Official major note<input name="major" required maxLength={100} /></label>
        <label>Official minor notes<input name="minor" maxLength={280} placeholder="Separate notes with a comma" /></label>
        <button className="wa-primary" type="submit">Reveal the wine</button>
      </form>
    );
  }

  const reveal = round.reveal;
  return (
    <>
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
        update({ ...round, matches: { Nate: readMatches("Nate"), Hallie: readMatches("Hallie") } });
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
      <h3>Review the wine</h3>
      <div className="wa-pair">
        {players.map(player => <ReviewForm key={player} player={player} review={round.reviews?.[player]}
          save={review => update({ ...round, reviews: { ...round.reviews, [player]: review } })} />)}
      </div>
      <form className="wa-bottle" onSubmit={event => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem("bottle") as HTMLInputElement;
        const bottle = input.value.trim();
        if (bottle && !/^https?:\/\//i.test(bottle)) {
          input.setCustomValidity("Enter a web address beginning with https:// or http://.");
          input.reportValidity();
          return;
        }
        update({ ...round, reveal: { ...reveal, bottle } });
      }}>
        <BottleLink wine={reveal.wine} bottle={reveal.bottle} />
        <label>Full-bottle link (optional)
          <input type="url" name="bottle" defaultValue={reveal.bottle} maxLength={2048}
            onChange={event => event.currentTarget.setCustomValidity("")} placeholder="https://…" />
        </label>
        <button type="submit">Save bottle link</button>
      </form>
    </>
  );
}

function BottleLink({ wine, bottle }: { wine: string; bottle: string }) {
  const search = `https://ingoodtaste.com/search?q=${encodeURIComponent(`${wine} 750ml`)}`;
  const direct = /^https?:\/\//i.test(bottle);
  return <a href={direct ? bottle : search} target="_blank" rel="noreferrer">{direct ? "View full bottle" : "Search In Good Taste for 750 ml"}</a>;
}

function ReviewForm({ player, review, save }: { player: Player; review?: Review; save: (review: Review) => void }) {
  const [editing, setEditing] = useState(false);
  return <form onChange={() => setEditing(true)} onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rating = Number(field(data, "rating"));
    if (rating < 1 || rating > 10 || !Number.isInteger(rating * 10)) return;
    save({ rating, note: field(data, "note") });
    setEditing(false);
  }}>
    <fieldset>
      <legend>{player}</legend>
      <label>Rating (1.0–10.0)<input type="number" name="rating" min="1" max="10" step="0.1" required defaultValue={review?.rating.toFixed(1)} /></label>
      <label>Tasting note (optional)<textarea name="note" rows={2} maxLength={1000} defaultValue={review?.note} /></label>
      <button type="submit">Save review</button>
      <p className="wa-saved" role="status">{!editing && review ? `Saved ${review.rating.toFixed(1)} / 10` : ""}</p>
    </fieldset>
  </form>;
}
