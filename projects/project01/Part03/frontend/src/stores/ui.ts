import { create } from 'zustand';

export interface MockAuth {
  isMockAuthed: boolean;
  givenname?: string;
  familyname?: string;
}

export interface UIState {
  sidebarCollapsed: boolean;
  mockAuth: MockAuth;
  toggleSidebar: () => void;
  setMockAuth: (a: MockAuth) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mockAuth: { isMockAuthed: false },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMockAuth: (a) => set({ mockAuth: a }),
}));
