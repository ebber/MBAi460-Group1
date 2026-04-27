import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      mockAuth: { isMockAuthed: false },
    });
  });

  it('toggleSidebar flips sidebarCollapsed', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('setMockAuth replaces the mockAuth shape', () => {
    useUIStore.getState().setMockAuth({
      isMockAuthed: true,
      givenname: 'Pooja',
      familyname: 'Sarkar',
    });
    const auth = useUIStore.getState().mockAuth;
    expect(auth.isMockAuthed).toBe(true);
    expect(auth.givenname).toBe('Pooja');
    expect(auth.familyname).toBe('Sarkar');
  });
});
