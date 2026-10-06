import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type StatusFilter = 'All projects' | 'Planned' | 'In progress' | 'On hold';
export type ViewMode = 'grid' | 'compact';

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

const initialWorkspaceState: Pick<
  WorkspaceStore,
  'statusFilter' | 'favoriteIds' | 'favoritesOnly' | 'viewMode'
> = {
  statusFilter: 'All projects',
  favoriteIds: [],
  favoritesOnly: false,
  viewMode: 'grid',
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      ...initialWorkspaceState,
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      toggleFavorite: (projectId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(projectId)
            ? state.favoriteIds.filter((id) => id !== projectId)
            : [...state.favoriteIds, projectId],
        })),
      toggleFavoritesOnly: () => set((state) => ({ favoritesOnly: !state.favoritesOnly })),
      setViewMode: (viewMode) => set({ viewMode }),
      resetWorkspace: () => set(initialWorkspaceState),
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
