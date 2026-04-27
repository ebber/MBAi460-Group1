import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders the wordmark on every route', () => {
    renderAt('/library');
    expect(screen.getByText('MBAi 460 — PhotoApp')).toBeInTheDocument();
  });

  it('redirects / to /library', () => {
    renderAt('/');
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('renders /login as a public route (Q10 non-blocking)', () => {
    renderAt('/login');
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders /upload as a public route (no auth gate per Q10)', () => {
    renderAt('/upload');
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders 404 for unknown routes', () => {
    renderAt('/random-path');
    expect(screen.getByText('404 — Not Found')).toBeInTheDocument();
  });
});
