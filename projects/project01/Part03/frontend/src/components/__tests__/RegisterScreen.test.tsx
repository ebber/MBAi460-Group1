// RegisterScreen — non-blocking visual scaffold tests.
//
// Per Q10 (`MetaFiles/DesignDecisions.md`): submit does NOT call fetch.
// It toggles `mockAuth` in the Zustand store and navigates to `/library`.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { RegisterScreen } from '../RegisterScreen';
import { useUIStore } from '@/stores/ui';

describe('RegisterScreen', () => {
  beforeEach(() => {
    useUIStore.setState({ mockAuth: { isMockAuthed: false } });
  });

  it('renders the register form with all 5 fields and the password-rules checklist', () => {
    render(
      <MemoryRouter>
        <RegisterScreen />
      </MemoryRouter>,
    );

    // 5 fields: given name, family name, username, password, confirm.
    expect(screen.getByLabelText(/given name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Password-rules checklist visible.
    const rules = screen.getByTestId('password-rules');
    expect(rules).toBeInTheDocument();
    expect(rules).toHaveTextContent(/8\+ chars/i);
    expect(rules).toHaveTextContent(/a digit/i);
    expect(rules).toHaveTextContent(/a symbol/i);

    // Create-account button + sign-in link.
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submit toggles mockAuth (with given+family name) without calling fetch (Q10)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterScreen />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/given name/i), 'Pooja');
    await user.type(screen.getByLabelText(/family name/i), 'Patel');
    await user.type(screen.getByLabelText(/^username$/i), 'pooja');
    await user.type(screen.getByLabelText(/^password$/i), 'pw1!aaaa');
    await user.type(screen.getByLabelText(/confirm password/i), 'pw1!aaaa');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    const state = useUIStore.getState();
    expect(state.mockAuth.isMockAuthed).toBe(true);
    expect(state.mockAuth.givenname).toBe('Pooja');
    expect(state.mockAuth.familyname).toBe('Patel');

    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('password-rules checklist marks rules as satisfied when matched', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterScreen />
      </MemoryRouter>,
    );

    const passwordField = screen.getByLabelText(/^password$/i);
    await user.type(passwordField, 'abcdefg1!');

    const rules = screen.getByTestId('password-rules');
    const items = rules.querySelectorAll('li');
    // All three rules should now be satisfied (>=8 chars, has digit, has symbol).
    items.forEach((li) => {
      expect(li.getAttribute('data-satisfied')).toBe('true');
    });
  });
});
