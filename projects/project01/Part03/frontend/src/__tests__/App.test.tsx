import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all API calls — this test exercises routing + shell, not data flow.
vi.mock('@/api/photoappApi', () => ({
  getPing: vi.fn(() => Promise.resolve({ s3_object_count: 0, user_count: 3 })),
  getUsers: vi.fn(() => Promise.resolve([])),
  getImages: vi.fn(() => Promise.resolve([])),
  getImageLabels: vi.fn(() => Promise.resolve([])),
  getImageFileUrl: (id: number) => `/api/images/${id}/file`,
  uploadImage: vi.fn(),
  searchImages: vi.fn(() => Promise.resolve([])),
  deleteAllImages: vi.fn(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing + shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the TopBar wordmark on every route', () => {
    renderAt('/library');
    expect(screen.getByText('MBAi 460')).toBeInTheDocument();
  });

  it('redirects / to /library (default route per Q10)', () => {
    renderAt('/');
    // /library renders LibraryPage in loading state (skeleton) or empty state.
    expect(
      screen.queryByTestId('library-loading') ?? screen.queryByText(/no assets yet/i),
    ).toBeTruthy();
  });

  it('renders /login as a public route (Q10 non-blocking)', () => {
    renderAt('/login');
    // LoginScreen renders a "Sign in" heading. There's also a submit button
    // with the same text, so disambiguate by role.
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders /upload as a public route (no auth gate per Q10)', () => {
    renderAt('/upload');
    expect(screen.queryByTestId('upload-loading')).toBeTruthy();
  });

  it('renders 404 for unknown routes', () => {
    renderAt('/random-path');
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
