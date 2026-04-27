// LoginScreen — non-blocking visual scaffold (Q10).
//
// Per `MetaFiles/DesignDecisions.md` Q10 and `01-ui-workstream.md` Phase 6
// Task 6.1: this screen is reachable at `/login` for visual demo only.
// Submitting does NOT call `POST /api/auth`. It toggles the Zustand
// `mockAuth` flag (so the topbar avatar can show initials) and navigates
// to `/library`. Real auth ships in
// `Future-State-auth-and-account-management-workstream.md`.
//
// Visual contract: `ClaudeDesignDrop/raw/MBAi-460/src/auth.jsx` lines 4–115.
// Visual fidelity is preserved structurally (centered card, paper-2 panel,
// "Sign in" heading, username/password fields, Forgot? link, Create-an-
// account link), but with Tailwind classes resolving to the translated
// design tokens instead of inline `var(--…)` styles.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Modal } from '@/components/Modal';
import { useUIStore } from '@/stores/ui';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const setMockAuth = useUIStore((s) => s.setMockAuth);
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Q10: NO fetch. Just toggle the visual mock-auth flag and navigate.
    setMockAuth({ isMockAuthed: true, givenname: username, familyname: '' });
    navigate('/library');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl font-medium tracking-tight text-ink">
          MBAi 460
        </h1>
        <p className="text-sm text-ink-3">Cloud PhotoApp · Spring 2026</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] rounded-lg border border-line bg-paper-2 p-6 shadow-2"
      >
        <h2 className="mb-5 font-serif text-lg font-medium text-ink">Sign in</h2>

        <div className="mb-4">
          <label
            htmlFor="login-username"
            className="mb-1 block text-xs font-medium text-ink-2"
          >
            Username
          </label>
          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>

        <div className="mb-2">
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-ink-2"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs text-ink-3 hover:text-accent"
            >
              Forgot?
            </button>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-fg hover:bg-accent-2"
        >
          Sign in
        </button>

        <div className="mt-4 border-t border-line pt-4 text-center text-sm">
          <span className="text-ink-3">New here? </span>
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </div>
      </form>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Forgot password?"
      >
        <p className="text-sm text-ink-2">
          Contact staff at help@example to reset your password.
        </p>
      </Modal>
    </div>
  );
}

export default LoginScreen;
