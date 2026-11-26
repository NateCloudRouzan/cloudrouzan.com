import { createRoot } from "react-dom/client";
import "../styles.css";
import "./portfolio.css";
import { projects } from "./projects";

const portfolio = "/chumani/chumani-portfolio.pdf";

function Portfolio() {
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
            {projects.map((project) => (
              <article className="chumani-project" key={project.id}>
                <img src={`/chumani/${project.id}.jpg`} alt={project.imageAlt} loading="lazy" />
                <div className="chumani-project-copy">
                  <p className="eyebrow">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p className="chumani-location">{project.location}</p>
                  <p>{project.description}</p>
                  <a href={`${portfolio}#page=${project.page}`} aria-label={`View ${project.title} in the portfolio PDF`}>View project in PDF</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} Chumani Cloud-Rouzan</footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Portfolio />);
