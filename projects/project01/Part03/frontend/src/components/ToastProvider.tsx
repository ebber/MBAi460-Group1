// ToastProvider — module-scoped context + hook + auto-dismissing stack.
//
// Ports the visual contract from `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`
// lines 4–33, with two intentional changes from the source:
//   1. `React.createContext(null)` global access becomes a module-scoped
//      `createContext` import + a `useToast()` hook that throws when called
//      outside the provider (so misuse fails loudly in tests instead of
//      silently no-op'ing).
//   2. Inline CSS-variable styles become Tailwind utility classes that
//      consume the translated theme tokens (paper / line / success / warn /
//      error / info / accent). The 4-tone palette is pinned to spec
//      §11; tones map to Andrew's `--color-{tone}` scale.
//
// Auto-dismiss is 4000ms per Phase 3 spec (Andrew's MVP used 3200ms; the
// workstream doc bumped it to 4s for the Vitest fake-timers contract).

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Icon } from '@/components/Icon';

export type ToastTone = 'success' | 'warn' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  addToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

// Tailwind tone classes consume the theme tokens translated from
// Andrew's tokens.css (success / warn / error / info / accent). The
// baseline (paper-2 + line) keeps the toast legible against the cream
// background; the left-border accent communicates tone at a glance.
const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-l-success',
  warn: 'border-l-warn',
  error: 'border-l-error',
  info: 'border-l-info',
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextIdRef.current++;
      setToasts((current) => [...current, { id, message, tone }]);
      // Auto-dismiss after TOAST_DURATION_MS. Using window.setTimeout so it
      // is captured by Vitest's fake-timers when tests opt in.
      window.setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, TOAST_DURATION_MS);
    },
    [],
  );

  const value: ToastContextValue = { addToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // Stack at bottom-right, above modals (which use z-50). Keep `pointer-events-none`
        // off the wrapper so close buttons remain interactive.
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={[
              'flex min-w-[260px] max-w-[380px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-paper-2 px-4 py-2.5 text-sm text-ink shadow-2',
              TONE_CLASSES[toast.tone],
            ].join(' ')}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              className="text-ink-3 transition-colors hover:text-ink"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error('useToast() must be called inside a <ToastProvider>.');
  }
  return ctx;
}

export default ToastProvider;
