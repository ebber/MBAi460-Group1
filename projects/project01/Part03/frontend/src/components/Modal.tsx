// Modal — portal-rendered dialog with Escape + click-outside dismissal
// and focus restoration.
//
// Ports the visual contract from `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`
// lines 35–68. Behavioral upgrades over Andrew's reference:
//   1. Renders via `createPortal` to `document.body` so the backdrop is
//      not clipped by parent overflow / transform contexts.
//   2. Captures `document.activeElement` when `open` flips true and
//      restores focus to it on close — keyboard users land back on the
//      trigger rather than the document body.
//   3. Click-outside uses a backdrop click handler with stopPropagation
//      on the panel (matches Andrew's pattern) but is wired through
//      `onMouseDown` so a drag-select that ends on the backdrop does not
//      accidentally dismiss.
//
// Reused later by Phase 7.6's delete-confirmation modal — keep the API
// minimal: `{ open, onClose, title?, children }`.

import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '@/components/Icon';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Track the previously-focused element so we can restore focus on close.
  // We deliberately use a ref (not state) — restoring focus is a side-effect,
  // not render-driven.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Capture the focused element when the modal opens; restore it on close.
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // After paint, move focus into the modal so screen readers & keyboard
    // users land inside the dialog.
    panelRef.current?.focus();

    return () => {
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function') {
        previous.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  // Escape-to-close — listen on the window, scoped to when `open` is true.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    // Only treat the click as "outside" when the mousedown landed on the
    // backdrop itself, not bubbled up from the panel.
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Stop propagation on the panel so a click that originates inside the
  // panel cannot trigger the backdrop's dismissal.
  const stopPanelPropagation = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  // Allow keyboard activation of the panel (e.g. for screen readers) without
  // bubbling Escape past our handler — that is already handled at the window
  // level, but we explicitly do nothing here.
  const noopKeyDown = (_event: ReactKeyboardEvent<HTMLDivElement>) => {
    // intentionally empty
  };

  return createPortal(
    <div
      // Backdrop: full-screen overlay. `bg-ink/40` matches Andrew's
      // rgba(28,27,24,0.35) without the alpha drift.
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
      onMouseDown={handleBackdropMouseDown}
      data-testid="modal-backdrop"
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Dialog'}
        tabIndex={-1}
        onMouseDown={stopPanelPropagation}
        onKeyDown={noopKeyDown}
        className="flex max-h-[85vh] w-full max-w-[480px] flex-col rounded-lg border border-line bg-paper shadow-2 outline-none"
        data-testid="modal-panel"
      >
        {title !== undefined && (
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <h2 className="flex-1 font-serif text-lg text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-sm p-1 text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
