import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page">
      <section className="notice" aria-labelledby="not-found-title">
        <h1 id="not-found-title">404 — Page not found</h1>
        <p>The address is outdated or contains a mistake.</p>
        <div className="notice__actions">
          <Link className="button" to="/">
            Back home
          </Link>
          <Link className="button button--ghost" to="/projects">
            To the project catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
