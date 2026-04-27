import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PageHeader } from '../PageHeader';

function renderHeader(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PageHeader', () => {
  it('renders the title as a heading', () => {
    renderHeader(<PageHeader title="Library" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Library' })).toBeInTheDocument();
  });

  it('renders subtitle text when provided', () => {
    renderHeader(<PageHeader title="Library" subtitle="All your assets" />);
    expect(screen.getByText('All your assets')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided, with links for items that have a `to` target', () => {
    renderHeader(
      <PageHeader
        title="Detail"
        breadcrumbs={[
          { label: 'Home', to: '/library' },
          { label: 'Asset 42' },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();

    // The first crumb has a `to` and renders as a link.
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/library');

    // The last crumb has no `to` and renders as plain text + aria-current.
    const lastCrumb = screen.getByText('Asset 42');
    expect(lastCrumb).toHaveAttribute('aria-current', 'page');
  });

  it('renders an actions slot when provided', () => {
    renderHeader(
      <PageHeader
        title="Library"
        actions={<button type="button">Upload</button>}
      />,
    );

    const slot = screen.getByTestId('page-header-actions');
    expect(slot).toContainElement(screen.getByRole('button', { name: 'Upload' }));
  });
});
