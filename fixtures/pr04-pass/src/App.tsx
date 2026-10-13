import { zodResolver } from '@hookform/resolvers/zod';
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Project = {
  id: string;
  name: string;
  summary: string;
  description: string;
  owner: string;
  status: 'Planned' | 'In progress' | 'On hold';
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

const projectSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(240, 'Description must be at most 240 characters'),
  owner: z.string().trim().min(2, 'Owner must be at least 2 characters'),
  status: z.enum(['Planned', 'In progress', 'On hold']),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const defaults: ProjectFormValues = {
  name: '',
  summary: '',
  description: '',
  owner: '',
  status: 'Planned',
};

type StatusFilter = 'All projects' | Project['status'];
type ViewMode = 'grid' | 'compact';
type WorkspaceStore = {
  statusFilter: StatusFilter;
  favoriteIds: string[];
  favoritesOnly: boolean;
  viewMode: ViewMode;
  setStatusFilter: (statusFilter: StatusFilter) => void;
  toggleFavorite: (projectId: string) => void;
  toggleFavoritesOnly: () => void;
  setViewMode: (viewMode: ViewMode) => void;
  resetWorkspace: () => void;
};

const workspaceDefaults: Pick<
  WorkspaceStore,
  'statusFilter' | 'favoriteIds' | 'favoritesOnly' | 'viewMode'
> = {
  statusFilter: 'All projects',
  favoriteIds: [],
  favoritesOnly: false,
  viewMode: 'grid',
};

const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      ...workspaceDefaults,
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      toggleFavorite: (projectId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(projectId)
            ? state.favoriteIds.filter((id) => id !== projectId)
            : [...state.favoriteIds, projectId],
        })),
      toggleFavoritesOnly: () => set((state) => ({ favoritesOnly: !state.favoritesOnly })),
      setViewMode: (viewMode) => set({ viewMode }),
      resetWorkspace: () => set(workspaceDefaults),
    }),
    {
      name: 'projecthub-workspace',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        statusFilter: state.statusFilter,
        favoriteIds: state.favoriteIds,
        favoritesOnly: state.favoritesOnly,
        viewMode: state.viewMode,
      }),
    },
  ),
);

function useProjects() {
  return useQuery(projectsQuery);
}

function HomePage() {
  return <h1>ProjectHub</h1>;
}

function ProjectsPage() {
  const { data = [], isError, isFetching, isPending, refetch } = useProjects();
  const statusFilter = useWorkspaceStore((state) => state.statusFilter);
  const favoriteIds = useWorkspaceStore((state) => state.favoriteIds);
  const favoritesOnly = useWorkspaceStore((state) => state.favoritesOnly);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setStatusFilter = useWorkspaceStore((state) => state.setStatusFilter);
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const toggleFavoritesOnly = useWorkspaceStore((state) => state.toggleFavoritesOnly);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);
  const visibleProjects = data.filter(
    (project) =>
      (statusFilter === 'All projects' || project.status === statusFilter) &&
      (!favoritesOnly || favoriteIds.includes(project.id)),
  );

  if (isPending) return <p role="status">Loading projects…</p>;
  if (isError) {
    return (
      <section role="alert">
        <h1>Could not load projects</h1>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section>
      <h1>Projects</h1>
      <Link to="/projects/new">Create project</Link>
      <button type="button" disabled={isFetching} onClick={() => void refetch()}>
        Refresh projects
      </button>
      {isFetching ? <p role="status">Refreshing projects…</p> : null}
      <section aria-label="Project workspace">
        <label>
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
        <button
          type="button"
          aria-pressed={viewMode === 'grid'}
          onClick={() => setViewMode('grid')}
        >
          Grid view
        </button>
        <button
          type="button"
          aria-pressed={viewMode === 'compact'}
          onClick={() => setViewMode('compact')}
        >
          Compact view
        </button>
        <button type="button" aria-pressed={favoritesOnly} onClick={toggleFavoritesOnly}>
          {favoritesOnly ? 'Show all projects' : 'Show favorites only'}
        </button>
        <p>{favoriteIds.length} {favoriteIds.length === 1 ? 'favorite' : 'favorites'}</p>
        <button type="button" onClick={resetWorkspace}>Reset workspace</button>
      </section>
      {visibleProjects.length === 0 ? (
        <section>
          <h2>
            {data.length === 0
              ? 'No projects yet'
              : favoritesOnly
                ? 'No favorite projects'
                : 'No projects match this view'}
          </h2>
        </section>
      ) : (
        <ul aria-label={viewMode === 'grid' ? 'Project grid' : 'Compact project list'}>
          {visibleProjects.map((project) => {
            const isFavorite = favoriteIds.includes(project.id);
            return (
              <li key={project.id}>
                <Link to={`/projects/${project.id}`}>{project.name}</Link>
                <button
                  type="button"
                  aria-label={`${isFavorite ? 'Remove' : 'Add'} ${project.name} ${
                    isFavorite ? 'from' : 'to'
                  } favorites`}
                  aria-pressed={isFavorite}
                  onClick={() => toggleFavorite(project.id)}
                >
                  {isFavorite ? '★ Saved' : '☆ Save'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert">
      {message}
    </p>
  ) : null;
}

function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    defaultValues: defaults,
    resolver: zodResolver(projectSchema),
  });

  const submitProject = (values: ProjectFormValues) => {
    const id = values.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const project: Project = { id, ...values };
    queryClient.setQueryData<Project[]>(projectsQuery.queryKey, (projects = []) => [
      ...projects.filter((candidate) => candidate.id !== id),
      project,
    ]);
    navigate(`/projects/${id}`);
  };

  return (
    <section>
      <h1>Create project</h1>
      <form aria-label="Create project" noValidate onSubmit={handleSubmit(submitProject)}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <input
            id="summary"
            aria-invalid={errors.summary ? 'true' : 'false'}
            aria-describedby={errors.summary ? 'summary-error' : undefined}
            {...register('summary')}
          />
          <FieldError id="summary-error" message={errors.summary?.message} />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={
              errors.description ? 'description-count description-error' : 'description-count'
            }
            {...register('description')}
          />
          <p id="description-count">{watch('description').length} / 240</p>
          <FieldError id="description-error" message={errors.description?.message} />
        </div>
        <div>
          <label htmlFor="owner">Owner</label>
          <input
            id="owner"
            aria-invalid={errors.owner ? 'true' : 'false'}
            aria-describedby={errors.owner ? 'owner-error' : undefined}
            {...register('owner')}
          />
          <FieldError id="owner-error" message={errors.owner?.message} />
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" {...register('status')}>
            <option>Planned</option>
            <option>In progress</option>
            <option>On hold</option>
          </select>
        </div>
        <button type="submit">Create project</button>
        <button type="button" onClick={() => reset(defaults)}>
          Reset form
        </button>
      </form>
    </section>
  );
}

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { data, isError, isPending, refetch } = useProjects();
  const favoriteIds = useWorkspaceStore((state) => state.favoriteIds);
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);

  if (isPending || !data) return <p role="status">Loading project…</p>;
  if (isError) {
    return (
      <section role="alert">
        <h1>Could not load project</h1>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
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

  const isFavorite = favoriteIds.includes(project.id);

  return (
    <article>
      <h1>{project.name}</h1>
      <button
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
      <p>{project.description}</p>
      <dl>
        <dt>Owner</dt>
        <dd>{project.owner}</dd>
        <dt>Status</dt>
        <dd>{project.status}</dd>
      </dl>
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
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
