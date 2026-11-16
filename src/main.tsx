import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="page">
      <div className="topline">cloudrouzan.com</div>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Software Engineer · Personal Website</p>
          <h1>Hi, I'm Nate.</h1>
          <p className="intro">
            I build software for infrastructure and distributed systems.
            This is my corner of the internet for projects, experiments, and writing.
          </p>
          <div className="links">
            <a href="https://github.com/NateCloudRouzan" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/cloudrouzan" target="_blank" rel="noreferrer">LinkedIn ↗</a>
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
        <div className="section-head"><h2>Projects</h2><span>Coming soon</span></div>
        <p>I'm setting up this space to share things I'm building. Check back soon.</p>
      </section>
      <footer>© {new Date().getFullYear()} Nate Cloud-Rouzan</footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
