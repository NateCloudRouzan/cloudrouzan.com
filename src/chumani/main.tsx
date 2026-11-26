import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import "./portfolio.css";
import { projects } from "./projects";

const portfolio = "/chumani/chumani-portfolio.pdf";

function Portfolio() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [projectIndex, setProjectIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0);
  const project = projects[projectIndex];
  const views = [
    { image: project.id, alt: project.imageAlt, caption: project.coverCaption },
    ...project.views,
  ];
  const view = views[viewIndex];

  function selectProject(index: number) {
    setProjectIndex((index + projects.length) % projects.length);
    setViewIndex(0);
    dialog.current?.scrollTo({ top: 0 });
  }

  function openProject(index: number) {
    selectProject(index);
    dialog.current?.showModal();
  }
  return (
    <div className="page chumani-page">
      <header className="topline chumani-nav">
        <a href="/">cloudrouzan.com</a>
        <a href="#work">Selected work</a>
      </header>
      <main>
        <section className="hero" aria-labelledby="chumani-name">
          <div className="hero-copy">
            <p className="eyebrow">Interior architecture &amp; design</p>
            <h1 id="chumani-name">Chumani<br />Cloud-Rouzan</h1>
            <p className="intro">A portfolio of interior design, space planning, and architectural visualization from the Academy of Art University.</p>
            <div className="links">
              <a className="portfolio-button" href={portfolio}>View portfolio PDF</a>
              <a href="#work">Explore the projects</a>
            </div>
          </div>
          <figure className="chumani-feature">
            <img src="/chumani/exhibition.jpg" alt="Interior rendering of the National Geographic exhibition space" />
            <figcaption>National Geographic · Exhibition concept</figcaption>
          </figure>
        </section>
        <section className="projects" id="work" aria-labelledby="work-heading">
          <div className="section-head">
            <h2 id="work-heading">Selected work</h2>
          </div>
          <div className="chumani-grid">
            {projects.map((project, index) => (
              <article className="chumani-project" key={project.id}>
                <img src={`/chumani/${project.id}.jpg`} alt={project.imageAlt} loading="lazy" />
                <div className="chumani-project-copy">
                  <p className="eyebrow">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p className="chumani-location">{project.location}</p>
                  <p>{project.description}</p>
                  <button
                    type="button"
                    className="chumani-open-project"
                    aria-haspopup="dialog"
                    aria-label={`Explore ${project.title}`}
                    onClick={() => openProject(index)}
                  >
                    Explore project
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <dialog ref={dialog} className="chumani-dialog" aria-labelledby="chumani-project-title">
        <div className="chumani-dialog-header">
          <p className="eyebrow">{project.category}</p>
          <button type="button" autoFocus onClick={() => dialog.current?.close()}>Close</button>
        </div>
        <h2 id="chumani-project-title" aria-live="polite">{project.title}</h2>
        <p className="chumani-dialog-location">{project.location}</p>
        <figure className="chumani-gallery">
          <img src={`/chumani/${view.image}.jpg`} alt={view.alt} loading="lazy" />
          <figcaption aria-live="polite">{view.caption}</figcaption>
        </figure>
        <div className="chumani-views" role="group" aria-label="Project images">
          {views.map((item, index) => (
            <button
              type="button"
              key={item.image}
              aria-pressed={index === viewIndex}
              onClick={() => setViewIndex(index)}
            >
              {item.caption}
            </button>
          ))}
        </div>
        <div className="chumani-design-note">
          <h3>Design approach</h3>
          <p>{project.designNote}</p>
          <a href={`${portfolio}#page=${project.page}`}>View project in PDF</a>
        </div>
        <nav className="chumani-project-navigation" aria-label="Browse projects">
          <button type="button" onClick={() => selectProject(projectIndex - 1)}>Previous project</button>
          <button type="button" onClick={() => selectProject(projectIndex + 1)}>Next project</button>
        </nav>
      </dialog>
      <footer>© {new Date().getFullYear()} Chumani Cloud-Rouzan</footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Portfolio />);
