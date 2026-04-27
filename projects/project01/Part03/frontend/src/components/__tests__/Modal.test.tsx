import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders children when open and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirm">
        <p>Are you sure?</p>
      </Modal>,
    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Confirm');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked but not when the panel is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Backdrop check">
        <p>panel-content</p>
      </Modal>,
    );

    // Click on the panel itself — should NOT call onClose.
    fireEvent.mouseDown(screen.getByTestId('modal-panel'));
    expect(onClose).not.toHaveBeenCalled();

    // Click on the backdrop — should call onClose.
    fireEvent.mouseDown(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the explicit close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="X-button check">
        <p>content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when open is false', () => {
    const onClose = vi.fn();
    render(
      <Modal open={false} onClose={onClose}>
        <p>hidden</p>
      </Modal>,
    );

    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('restores focus to the previously focused element on close', () => {
    const onClose = vi.fn();

    function Harness({ open }: { open: boolean }) {
      return (
        <>
          <button type="button" data-testid="trigger">
            trigger
          </button>
          <Modal open={open} onClose={onClose}>
            <p>focus-restore-content</p>
          </Modal>
        </>
      );
    }

    const { rerender } = render(<Harness open={false} />);
    const trigger = screen.getByTestId('trigger');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerender(<Harness open={true} />);
    // Modal's panel should have grabbed focus.
    expect(document.activeElement).toBe(screen.getByTestId('modal-panel'));

    rerender(<Harness open={false} />);
    // Focus should be restored to the trigger.
    expect(document.activeElement).toBe(trigger);
  });
});
