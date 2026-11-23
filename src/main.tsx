import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
const BarBuddy = React.lazy(() => import("./barbuddy/BarBuddy"));

const WineAdvent = React.lazy(() => import("./wine-advent/WineAdvent"));

function App() {
  return (
    <main className="page">
      <div className="topline">cloudrouzan.com</div>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Software Engineer · Personal Website</p>
          <h1>Hi, I'm Nate.</h1>
          <p className="intro">
            I build software for infrastructure and distributed systems. This is
            my corner of the internet for projects, experiments, and writing.
          </p>
          <div className="links">
            <a
              href="https://github.com/NateCloudRouzan"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/cloudrouzan"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
        <img
          className="portrait"
          src="/images/nate-seattle.jpg"
          alt="Nate Cloud-Rouzan on a ferry with the Seattle skyline behind him"
          width="933"
          height="1000"
          fetchPriority="high"
        />
      </section>
      <section className="projects">
        <div className="section-head">
          <h2>Projects</h2>
          <span>Tools & experiments</span>
        </div>
        <a className="project-card" href="/BarBuddy">
          <h3>BarBuddy ↗</h3>
          <p>
            A cocktail companion for what’s on your shelf. Find a drink,
            discover ingredient unlocks, and plan your next supply run.
          </p>
          <span>Explore BarBuddy</span>
        </a>
        <a className="project-card" href="/WineAdvent">
          <h3>Wine Advent</h3>
          <p>A two-player blind tasting game with 24 doors and a ranked bottle list.</p>
          <span>Play Wine Advent</span>
        </a>
        <a
          className="project-card"
          href="https://github.com/NateCloudRouzan/tidal-scripts"
          target="_blank"
          rel="noreferrer"
        >
          <h3>TIDAL Collection Repair</h3>
          <p>
            A Python command-line tool for finding unavailable saved tracks,
            proposing playable versions of the same recording, and auditing
            TIDAL playlists.
          </p>
          <span>View on GitHub</span>
        </a>
      </section>
      <footer>© {new Date().getFullYear()} Nate Cloud-Rouzan</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/^\/wineadvent\/?$/i.test(window.location.pathname) ? (
      <React.Suspense fallback={<main className="page"><p>Opening Wine Advent…</p></main>}>
        <WineAdvent />
      </React.Suspense>
    ) : /^\/barbuddy\/?$/i.test(window.location.pathname) ? (
      <React.Suspense
        fallback={
          <main className="page">
            <p>Opening BarBuddy…</p>
          </main>
        }
      >
        <BarBuddy />
      </React.Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
