import { create } from 'zustand';
import type { PanelState, Toast } from '@/types';
import { generateId } from '@/lib/utils';

interface UIState {
  panel: PanelState;
  toasts: Toast[];
  isShortcutsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isShareModalOpen: boolean;
  isExportModalOpen: boolean;
  isNewProjectModalOpen: boolean;
  isSidebarCollapsed: boolean;
  activeProjectId: string | null;

  openPanel: (type: PanelState['panelType'], id?: string) => void;
  closePanel: () => void;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  setShortcutsModal: (open: boolean) => void;
  setSettingsModal: (open: boolean) => void;
  setShareModal: (open: boolean) => void;
  setExportModal: (open: boolean) => void;
  setNewProjectModal: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveProjectId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  panel: { isOpen: false },
  toasts: [],
  isShortcutsModalOpen: false,
  isSettingsModalOpen: false,
  isShareModalOpen: false,
  isExportModalOpen: false,
  isNewProjectModalOpen: false,
  isSidebarCollapsed: false,
  activeProjectId: null,

  openPanel: (type, id) =>
    set({
      panel: {
        isOpen: true,
        panelType: type,
        activeNodeId: type === 'node' ? id : undefined,
        activeEdgeId: type === 'edge' ? id : undefined,
        activeLayerId: type === 'layer' ? id : undefined,
      },
    }),

  closePanel: () => set({ panel: { isOpen: false } }),

  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setShortcutsModal: (open) => set({ isShortcutsModalOpen: open }),
  setSettingsModal: (open) => set({ isSettingsModalOpen: open }),
  setShareModal: (open) => set({ isShareModalOpen: open }),
  setExportModal: (open) => set({ isExportModalOpen: open }),
  setNewProjectModal: (open) => set({ isNewProjectModalOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
}));
