// TopBar — sticky shell header (MVP shape).
//
// Shape per UI workstream Phase 3 Task 3.2 (MVP-trimmed): wordmark on the
// left, avatar dropdown on the right. The reference component in
// `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx` (lines 70–165) also
// includes a ⌘K trigger button, a tweaks toggle, and a notifications bell;
// those primitives are descoped to their respective Future-State
// workstreams (CommandPalette / TweaksPanel / Notifications) and are
// physically OMITTED from this JSX rather than left as no-op stubs — the
// demo must not show buttons that do nothing (UI burr-patch, M-2).
//
// shadcn/ui DropdownMenu was descoped 2026-04-27, so the avatar menu is
// implemented as a custom Tailwind-styled disclosure with the ARIA
// disclosure pattern (button + role="menu"). Closes on Escape and on
// outside click.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useUIStore } from '@/stores/ui';

export function TopBar() {
  const mockAuth = useUIStore((s) => s.mockAuth);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape (only listen when open — avoids work in steady state).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Close on outside click. We compare against the container ref so clicks
  // on the trigger or inside the menu do NOT count as "outside".
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const initials =
    mockAuth.isMockAuthed && mockAuth.givenname && mockAuth.familyname
      ? `${mockAuth.givenname[0] ?? ''}${mockAuth.familyname[0] ?? ''}`.toUpperCase()
      : '';

  return (
    <header className="sticky top-0 z-30 h-topbar bg-paper border-b border-line flex items-center px-5">
      <h1 className="text-lg font-serif">MBAi 460</h1>

      <div className="ml-auto" ref={containerRef}>
        <div className="relative">
          <button
            type="button"
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={
              mockAuth.isMockAuthed
                ? 'w-8 h-8 rounded-full bg-accent text-accent-fg flex items-center justify-center text-sm font-medium'
                : 'w-8 h-8 rounded-full bg-paper-2 border border-line flex items-center justify-center'
            }
          >
            {mockAuth.isMockAuthed ? (
              initials
            ) : (
              <Icon name="user" size={20} className="text-ink-2" />
            )}
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 bg-paper border border-line rounded-md shadow-2 py-1"
            >
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-paper-2"
              >
                <Icon name="user" size={16} className="text-ink-2" />
                Profile
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-ink-2 hover:bg-paper-2"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
