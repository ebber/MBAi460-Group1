// RegisterScreen — non-blocking visual scaffold (Q10).
//
// Per `MetaFiles/DesignDecisions.md` Q10 and `01-ui-workstream.md` Phase 6
// Task 6.1: this screen is reachable at `/register` for visual demo only.
// Submitting does NOT call `POST /api/users`. It toggles the Zustand
// `mockAuth` flag and navigates to `/library`. Real account creation ships
// in `Future-State-auth-and-account-management-workstream.md`.
//
// Visual contract: `ClaudeDesignDrop/raw/MBAi-460/src/auth.jsx` lines 117–181.
// Preserves Andrew's password-rules checklist (≥8 chars, a digit, a symbol)
// turning green when satisfied. Visual fidelity, not behavioral gating —
// the form will submit regardless because Q10 is non-blocking.

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { useUIStore } from '@/stores/ui';

interface PasswordChecks {
  len: boolean;
  digit: boolean;
  symbol: boolean;
}

function evaluatePassword(password: string): PasswordChecks {
  return {
    len: password.length >= 8,
    digit: /\d/.test(password),
    symbol: /[^\w\s]/.test(password),
  };
}

export function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [givenname, setGivenname] = useState('');
  const [familyname, setFamilyname] = useState('');

  const setMockAuth = useUIStore((s) => s.setMockAuth);
  const navigate = useNavigate();

  const checks = evaluatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirm;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Q10: NO fetch. Just toggle the visual mock-auth flag and navigate.
    setMockAuth({ isMockAuthed: true, givenname, familyname });
    navigate('/library');
  }

  const rules: ReadonlyArray<{ key: keyof PasswordChecks; label: string }> = [
    { key: 'len', label: '8+ chars' },
    { key: 'digit', label: 'a digit' },
    { key: 'symbol', label: 'a symbol' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl font-medium tracking-tight text-ink">
          MBAi 460
        </h1>
        <p className="text-sm text-ink-3">Create your account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[440px] rounded-lg border border-line bg-paper-2 p-6 shadow-2"
      >
        <h2 className="mb-5 font-serif text-lg font-medium text-ink">
          Create account
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="register-givenname"
              className="mb-1 block text-xs font-medium text-ink-2"
            >
              Given name
            </label>
            <input
              id="register-givenname"
              name="givenname"
              type="text"
              autoComplete="given-name"
              value={givenname}
              onChange={(e) => setGivenname(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
          </div>
          <div>
            <label
              htmlFor="register-familyname"
              className="mb-1 block text-xs font-medium text-ink-2"
            >
              Family name
            </label>
            <input
              id="register-familyname"
              name="familyname"
              type="text"
              autoComplete="family-name"
              value={familyname}
              onChange={(e) => setFamilyname(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="register-username"
            className="mb-1 block text-xs font-medium text-ink-2"
          >
            Username
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="register-password"
            className="mb-1 block text-xs font-medium text-ink-2"
          >
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
          <ul
            className="mt-2 flex flex-wrap gap-3 text-xs"
            data-testid="password-rules"
          >
            {rules.map(({ key, label }) => {
              const satisfied = checks[key];
              return (
                <li
                  key={key}
                  className={`inline-flex items-center gap-1 ${
                    satisfied ? 'text-success' : 'text-ink-3'
                  }`}
                  data-satisfied={satisfied ? 'true' : 'false'}
                >
                  <Icon name={satisfied ? 'check' : 'close'} size={11} />
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-5">
          <label
            htmlFor="register-confirm"
            className="mb-1 block text-xs font-medium text-ink-2"
          >
            Confirm password
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
          {confirm.length > 0 && !passwordsMatch && (
            <p className="mt-1 text-xs text-error">Passwords don't match.</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-fg hover:bg-accent-2"
        >
          Create account
        </button>

        <div className="mt-4 border-t border-line pt-4 text-center text-sm">
          <span className="text-ink-3">Already have one? </span>
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterScreen;
