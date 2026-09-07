import { BrowserRouter, Route, Routes } from 'react-router-dom';

/**
 * Known-bad PR01 fixture: deliberately incomplete student work worth exactly 40/80.
 *
 * Implemented: `/`, `/projects`, a graceful `/projects/` and accessible navigation.
 * Deliberately missing: the `/projects/:projectId` route, the catch-all 404 and
 * client-side transitions — the links are plain <a href> elements, so the route
 * only changes through a full page reload.
 *
 * If the fixture ever starts passing the fifth behaviour, relax the fixture,
 * not the test suite.
 */

const PROJECTS = [
  { id: 'onboarding', title: 'Team onboarding' },
  { id: 'analytics', title: 'Product analytics' },
  { id: 'mobile-app', title: 'Mobile app' },
];

function HomePage() {
  return (
    <section>
      <h1>ProjectHub</h1>
      <p>The place where the team sees all of its projects in a single list.</p>
    </section>
  );
}

function ProjectsPage() {
  return (
    <section>
      <h1>Projects</h1>
      <ul>
        {PROJECTS.map((project) => (
          <li key={project.id}>
            <a href={`/projects/${project.id}`}>{project.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <nav aria-label="Main navigation">
            <a href="/">Home</a>
            <a href="/projects">Projects</a>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
