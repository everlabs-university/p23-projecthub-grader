import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Project } from './model';

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch('/projects.json');

  if (!response.ok) {
    throw new Error('Could not load projects.');
  }

  return response.json() as Promise<Project[]>;
}

export const projectsQuery = queryOptions({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 60_000,
});

export function useProjects() {
  return useQuery(projectsQuery);
}
