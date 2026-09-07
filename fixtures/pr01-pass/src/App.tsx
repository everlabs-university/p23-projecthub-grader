import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';

/** Known-good PR01 fixture: all eight visible behaviours are implemented, 80/80 expected. */

type Project = {
  id: string;
  title: string;
  summary: string;
};

const PROJECTS: Project[] = [
  {
    id: 'onboarding',
    title: 'Team onboarding',
    summary: 'A checklist and materials for a new developer’s first two weeks.',
  },
  {
    id: 'analytics',
    title: 'Product analytics',
    summary: 'Dashboards for activation, retention and weekly active users.',
  },
  {
    id: 'mobile-app',
    title: 'Mobile app',
    summary: 'An iOS and Android client on the shared ProjectHub API.',
  },
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
            <Link to={`/projects/${project.id}`}>{project.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = PROJECTS.find((candidate) => candidate.id === projectId);

  if (!project) {
    return (
      <section>
        <h1>Project not found</h1>
        <p>There is no project with the id “{projectId}” in the list.</p>
        <Link to="/projects">Back to the project list</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>{project.title}</h1>
      <p>{project.summary}</p>
      <Link to="/projects">Back to the project list</Link>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section>
      <h1>404 — page not found</h1>
      <p>Check the address or go back to the home page.</p>
      <Link to="/">Home</Link>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <nav aria-label="Main navigation">
            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
