import { Link } from 'react-router-dom';

const HIGHLIGHTS = [
  ['Shared catalog', 'All team initiatives collected in one list.'],
  ['An address for every entry', 'Every project has its own route and direct link.'],
  ['Predictable states', 'An unknown address shows an explanation and a way back.'],
];

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">P-23 practicum</p>
        <h1 className="hero__title" id="home-title">
          ProjectHub — a shared team space
        </h1>
        <p className="hero__lead">
          A catalog of initiatives with owners, statuses, and a dedicated address
          for every entry.
        </p>
        <Link className="button" to="/projects">
          Open the catalog
        </Link>
      </section>

      <section className="panel" aria-labelledby="features-title">
        <h2 id="features-title">What ProjectHub can do</h2>
        <ul className="feature-grid">
          {HIGHLIGHTS.map(([title, text]) => (
            <li className="feature" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
