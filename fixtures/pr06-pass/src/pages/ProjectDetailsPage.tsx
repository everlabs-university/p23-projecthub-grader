import { Link, useParams } from 'react-router-dom';

import { useProjects } from '../features/projects/query';
import { useWorkspaceStore } from '../features/workspace/workspaceStore';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: projects, isPending } = useProjects();
  const favoriteIds = useWorkspaceStore((state) => state.favoriteIds);
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);

  if (isPending || !projects) {
    return <p role="status">Loading project…</p>;
  }

  const project = projects.find((candidate) => candidate.id === projectId);

  if (!project) {
    return (
      <div className="page">
        <section className="notice" aria-labelledby="missing-project-title">
          <h1 id="missing-project-title">Project not found</h1>
          <p>
            {projectId
              ? `The catalog has no project with the id "${projectId}".`
              : 'The address is incomplete: it has no project id.'}
          </p>
          <Link className="button" to="/projects">
            Back to the catalog
          </Link>
        </section>
      </div>
    );
  }

  const isFavorite = favoriteIds.includes(project.id);

  return (
    <div className="page">
      <p className="backlink">
        <Link to="/projects">← All projects</Link>
      </p>
      <article className="project" aria-labelledby="project-title">
        <header>
          <p className="eyebrow">{project.status}</p>
          <h1 id="project-title">{project.name}</h1>
          <p className="page__lead">{project.summary}</p>
          <button
            className="button button--ghost"
            type="button"
            aria-label={`${isFavorite ? 'Remove' : 'Add'} ${project.name} ${
              isFavorite ? 'from' : 'to'
            } favorites`}
            aria-pressed={isFavorite}
            onClick={() => toggleFavorite(project.id)}
          >
            {isFavorite ? '★ Saved' : '☆ Save'}
          </button>
        </header>
        <p>{project.description}</p>
        <dl className="project-meta">
          <div>
            <dt>Owner</dt>
            <dd>{project.owner}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{project.status}</dd>
          </div>
        </dl>
      </article>
    </div>
  );
}
