import { QueryClient, QueryClientProvider, queryOptions, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';

type Project = {
  id: string;
  name: string;
  summary: string;
  description: string;
  owner: string;
  status: string;
};

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch('/projects.json');
  if (!response.ok) throw new Error('Could not load projects.');
  return response.json() as Promise<Project[]>;
}

const projectsQuery = queryOptions({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 60_000,
});

function useProjects() {
  return useQuery(projectsQuery);
}

function HomePage() {
  return <h1>ProjectHub</h1>;
}

function ProjectsPage() {
  const { data = [], isError, isFetching, isPending, refetch } = useProjects();

  if (isPending) return <p role="status">Loading projects…</p>;
  if (isError) {
    return (
      <section role="alert">
        <h1>Could not load projects</h1>
        <button type="button" onClick={() => void refetch()}>Try again</button>
      </section>
    );
  }

  return (
    <section>
      <h1>Projects</h1>
      <button type="button" disabled={isFetching} onClick={() => void refetch()}>
        Refresh projects
      </button>
      {isFetching ? <p role="status">Refreshing projects…</p> : null}
      {data.length === 0 ? (
        <h2>No projects yet</h2>
      ) : (
        <ul>
          {data.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { data, isError, isPending, refetch } = useProjects();

  if (isPending || !data) return <p role="status">Loading project…</p>;
  if (isError) {
    return (
      <section role="alert">
        <h1>Could not load project</h1>
        <button type="button" onClick={() => void refetch()}>Try again</button>
      </section>
    );
  }

  const project = data.find((candidate) => candidate.id === projectId);
  if (!project) {
    return (
      <section>
        <h1>Project not found</h1>
        <Link to="/projects">Back to projects</Link>
      </section>
    );
  }

  return (
    <article>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <Link to="/projects">Back to projects</Link>
    </article>
  );
}

function NotFoundPage() {
  return (
    <section>
      <h1>404 — page not found</h1>
      <Link to="/">Home</Link>
    </section>
  );
}

export default function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <nav aria-label="Main navigation">
            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
          </nav>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
