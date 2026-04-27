import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';

import { ToastProvider, useToast, type ToastTone } from '../ToastProvider';

// Small harness that exposes the addToast hook to the test via a click.
function ToastTrigger({ message, tone }: { message: string; tone?: ToastTone }) {
  const { addToast } = useToast();
  return (
    <button type="button" onClick={() => addToast(message, tone)}>
      fire
    </button>
  );
}

describe('ToastProvider', () => {
  it('renders a toast added via useToast()', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Hello" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole('button', { name: 'fire' }).click();
    });

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('auto-dismisses a toast after 4000ms', () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <ToastTrigger message="ByeBye" tone="success" />
        </ToastProvider>,
      );

      act(() => {
        screen.getByRole('button', { name: 'fire' }).click();
      });

      expect(screen.getByText('ByeBye')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(screen.queryByText('ByeBye')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('throws when useToast is used outside ToastProvider', () => {
    // Suppress React's expected error log for this negative test.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<ToastTrigger message="x" />)).toThrow(
        /must be called inside a <ToastProvider>/,
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
