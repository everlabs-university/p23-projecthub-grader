import { Link } from 'react-router-dom';

import { useProjects } from '../features/projects/query';
import {
  type StatusFilter,
  useWorkspaceStore,
} from '../features/workspace/workspaceStore';

export default function ProjectsPage() {
  const { data: projects = [], isError, isFetching, isPending, refetch } = useProjects();
  const statusFilter = useWorkspaceStore((state) => state.statusFilter);
  const setStatusFilter = useWorkspaceStore((state) => state.setStatusFilter);
  const favoriteIds = useWorkspaceStore((state) => state.favoriteIds);
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const favoritesOnly = useWorkspaceStore((state) => state.favoritesOnly);
  const toggleFavoritesOnly = useWorkspaceStore((state) => state.toggleFavoritesOnly);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);
  const visibleProjects = projects.filter(
    (project) =>
      (statusFilter === 'All projects' || project.status === statusFilter) &&
      (!favoritesOnly || favoriteIds.includes(project.id)),
  );

  if (isPending) {
    return <p role="status">Loading projects…</p>;
  }

  if (isError) {
    return (
      <section role="alert">
        <h1>Could not load projects</h1>
        <p>The project catalog is temporarily unavailable.</p>
        <button className="button" type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Projects</h1>
        <p className="page__lead">
          Open an entry to see its description, owner, and status.
        </p>
        <Link className="button" to="/projects/new">
          Create project
        </Link>
        <button
          className="button button--ghost"
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          Refresh projects
        </button>
        {isFetching ? <p role="status">Refreshing projects…</p> : null}
      </header>

      <section className="workspace" aria-label="Project workspace">
        <label className="workspace__field">
          Filter by status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option>All projects</option>
            <option>Planned</option>
            <option>In progress</option>
            <option>On hold</option>
          </select>
        </label>
        <div className="workspace__controls">
          <button
            className="workspace__toggle"
            type="button"
            aria-pressed={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            Grid view
          </button>
          <button
            className="workspace__toggle"
            type="button"
            aria-pressed={viewMode === 'compact'}
            onClick={() => setViewMode('compact')}
          >
            Compact view
          </button>
          <button
            className="workspace__toggle"
            type="button"
            aria-pressed={favoritesOnly}
            onClick={toggleFavoritesOnly}
          >
            {favoritesOnly ? 'Show all projects' : 'Show favorites only'}
          </button>
        </div>
        <p className="workspace__count">
          {favoriteIds.length} {favoriteIds.length === 1 ? 'favorite' : 'favorites'}
        </p>
        <button className="button button--ghost" type="button" onClick={resetWorkspace}>
          Reset workspace
        </button>
      </section>

      {visibleProjects.length === 0 ? (
        <section className="empty">
          <h2>
            {projects.length === 0
              ? 'No projects yet'
              : favoritesOnly
                ? 'No favorite projects'
                : 'No projects match this view'}
          </h2>
          <p>
            {projects.length === 0
              ? 'The catalog is empty for now.'
              : favoritesOnly
                ? 'Save a project to keep it in this workspace.'
                : 'Choose another status to see more projects.'}
          </p>
        </section>
      ) : (
        <ul
          className={`project-list project-list--${viewMode}`}
          aria-label={viewMode === 'grid' ? 'Project grid' : 'Compact project list'}
        >
          {visibleProjects.map((project) => {
            const isFavorite = favoriteIds.includes(project.id);

            return (
              <li className="project-card" key={project.id}>
                <h2>
                  <Link to={`/projects/${project.id}`}>{project.name}</Link>
                </h2>
                <button
                  className="favorite-button"
                  type="button"
                  aria-label={`${isFavorite ? 'Remove' : 'Add'} ${project.name} ${
                    isFavorite ? 'from' : 'to'
                  } favorites`}
                  aria-pressed={isFavorite}
                  onClick={() => toggleFavorite(project.id)}
                >
                  {isFavorite ? '★ Saved' : '☆ Save'}
                </button>
                <p>{project.summary}</p>
                <dl className="project-meta">
                  <div>
                    <dt>Status</dt>
                    <dd>{project.status}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{project.owner}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
