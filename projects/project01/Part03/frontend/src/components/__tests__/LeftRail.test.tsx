import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { LeftRail } from '../LeftRail';
import { useUIStore } from '@/stores/ui';

function reset() {
  useUIStore.setState({ sidebarCollapsed: false });
}

describe('LeftRail', () => {
  beforeEach(() => {
    reset();
  });

  it('renders the five MVP nav items', () => {
    render(
      <MemoryRouter initialEntries={['/library']}>
        <LeftRail />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /library/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /help/i })).toBeInTheDocument();
  });

  it('marks the Library item active when the route is /library', () => {
    render(
      <MemoryRouter initialEntries={['/library']}>
        <LeftRail />
      </MemoryRouter>,
    );

    const libraryLink = screen.getByRole('link', { name: /library/i });
    expect(libraryLink).toHaveAttribute('aria-current', 'page');
    expect(libraryLink.className).toContain('bg-accent-soft');

    // Profile (a non-active route) should not have aria-current.
    expect(screen.getByRole('link', { name: /profile/i })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks the Profile item active for nested /profile/* routes', () => {
    render(
      <MemoryRouter initialEntries={['/profile/settings']}>
        <LeftRail />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('hides labels (and group headings) when sidebarCollapsed is true', () => {
    useUIStore.setState({ sidebarCollapsed: true });

    render(
      <MemoryRouter initialEntries={['/library']}>
        <LeftRail />
      </MemoryRouter>,
    );

    // Group headings are not rendered in collapsed mode.
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('You')).not.toBeInTheDocument();
    expect(screen.queryByText('Help')).not.toBeInTheDocument();

    // Item labels are not rendered as text either — only the icon
    // remains. We assert by querying the visible label text.
    expect(screen.queryByText('Library')).not.toBeInTheDocument();
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();

    // Links still render (so users can click), with title attrs for tooltips.
    const libraryLink = screen.getByTitle('Library');
    expect(libraryLink).toBeInTheDocument();

    // The aside element should advertise its collapsed state.
    expect(screen.getByTestId('left-rail')).toHaveAttribute('data-collapsed', 'true');
  });
});
