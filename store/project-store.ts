import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  searchQuery: string;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSearchQuery: (query: string) => void;

  getFilteredProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      searchQuery: '',

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => {
          if (state.projects.some((p) => p.id === project.id)) return state;
          return { projects: [project, ...state.projects] };
        }),

      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...data }
              : state.currentProject,
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        })),

      setCurrentProject: (project) => set({ currentProject: project }),
      setLoading: (isLoading) => set({ isLoading }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      getFilteredProjects: () => {
        const { projects, searchQuery } = get();
        // deduplicate just in case there are duplicates in persisted state
        const uniqueProjects = Array.from(new Map(projects.map(p => [p.id, p])).values());
        
        if (!searchQuery.trim()) return uniqueProjects;
        const q = searchQuery.toLowerCase();
        return uniqueProjects.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description?.toLowerCase().includes(q) ?? false)
        );
      },
    }),
    {
      name: 'nnn-projects',
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
);
