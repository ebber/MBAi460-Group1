// LoginScreen — non-blocking visual scaffold tests.
//
// These tests enforce Q10's HARD CONSTRAINT: submit must NOT call fetch.
// Per `MetaFiles/DesignDecisions.md` Q10, the submit handler only toggles
// the Zustand `mockAuth` flag and navigates to `/library`.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { LoginScreen } from '../LoginScreen';
import { useUIStore } from '@/stores/ui';

describe('LoginScreen', () => {
  beforeEach(() => {
    useUIStore.setState({ mockAuth: { isMockAuthed: false } });
  });

  it('renders the sign-in form with username and password fields', () => {
    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>,
    );

    // Title visible.
    expect(
      screen.getByRole('heading', { name: /sign in/i, level: 2 }),
    ).toBeInTheDocument();

    // Both fields present.
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Submit button + create-account link.
    expect(
      screen.getByRole('button', { name: /^sign in$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /create an account/i }),
    ).toBeInTheDocument();
  });

  it('submit toggles mockAuth without calling fetch (Q10)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/username/i), 'Pooja');
    await user.type(screen.getByLabelText(/password/i), 'x');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    const state = useUIStore.getState();
    expect(state.mockAuth.isMockAuthed).toBe(true);
    expect(state.mockAuth.givenname).toBe('Pooja');
    expect(state.mockAuth.familyname).toBe('');

    // The HARD CONSTRAINT: no fetch call ever happened.
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('Forgot link opens a modal with staff-contact text', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>,
    );

    // The modal contents should not be visible initially.
    expect(
      screen.queryByText(/contact staff at help@example/i),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /forgot\?/i }));

    // The modal's body should now show the staff-contact line.
    expect(
      screen.getByText(/contact staff at help@example/i),
    ).toBeInTheDocument();
  });
});
