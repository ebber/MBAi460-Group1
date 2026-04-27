import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { useUIStore } from '@/stores/ui';

function renderTopBar() {
  return render(
    <MemoryRouter>
      <TopBar />
    </MemoryRouter>,
  );
}

describe('TopBar', () => {
  beforeEach(() => {
    // Reset to anonymous default per Q10 (mockAuth = false at startup).
    useUIStore.setState({ mockAuth: { isMockAuthed: false } });
  });

  it('renders the wordmark', () => {
    renderTopBar();
    expect(screen.getByText('MBAi 460')).toBeInTheDocument();
  });

  it('renders anonymous icon when not mock-authed and keeps menu hidden initially', () => {
    renderTopBar();
    const trigger = screen.getByRole('button', { name: 'User menu' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByText('Sign out')).toBeNull();
  });

  it('renders initials when mock-authed', () => {
    useUIStore.setState({
      mockAuth: { isMockAuthed: true, givenname: 'Pooja', familyname: 'Sarkar' },
    });
    renderTopBar();
    expect(screen.getByText('PS')).toBeInTheDocument();
  });

  it('opens the avatar dropdown on click and closes on Escape', async () => {
    const user = userEvent.setup();
    renderTopBar();
    const trigger = screen.getByRole('button', { name: 'User menu' });

    await user.click(trigger);
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Sign out')).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does NOT render ⌘K, tweaks, or notifications affordances (MVP shape)', () => {
    renderTopBar();
    expect(screen.queryByText(/⌘K/i)).toBeNull();
    expect(screen.queryByText(/tweaks/i)).toBeNull();
    expect(screen.queryByText(/notifications/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /tweaks/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /notifications/i })).toBeNull();
  });
});
