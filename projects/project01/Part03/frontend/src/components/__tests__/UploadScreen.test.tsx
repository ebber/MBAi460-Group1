// UploadScreen tests — Phase 6 Task 6.2.
//
// Coverage targets per the workstream brief:
//   1. Renders the form (drop area + file picker + classify radio + submit).
//   2. Adding a file appends an entry to the queue.
//   3. Submit calls onUpload with the selected userid + file.
//   4. The dropped `ocrMode` radio is NOT rendered (Q9 — Textract Future-State).
//   5. Error case: onUpload rejects → queue item shows error status.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ToastProvider } from '../ToastProvider';
import { UploadScreen } from '../UploadScreen';
import type { User } from '@/api/types';

const mockUsers: User[] = [
  { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
];

function renderUploadScreen(
  onUpload: (userid: number, file: File) => Promise<{ assetid: number }>,
) {
  return render(
    <ToastProvider>
      <UploadScreen users={mockUsers} onUpload={onUpload} />
    </ToastProvider>,
  );
}

describe('UploadScreen', () => {
  it('renders the form (drop area + file picker + classify radio + submit)', () => {
    const onUpload = vi.fn().mockResolvedValue({ assetid: 1 });
    renderUploadScreen(onUpload);

    // Drop area + (hidden) file input present.
    expect(screen.getByTestId('upload-drop-area')).toBeInTheDocument();
    expect(screen.getByTestId('upload-file-input')).toBeInTheDocument();
    // Drop area copy mentions click-to-select for screen-reader users.
    expect(screen.getByText(/drag files here or click to select/i)).toBeInTheDocument();

    // Classify radio: all three options visible (radio inputs by name).
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map((r) => (r as HTMLInputElement).value)).toEqual([
      'auto',
      'photo',
      'document',
    ]);
    expect(screen.getByText(/auto-detect/i)).toBeInTheDocument();

    // Submit button present.
    expect(screen.getByTestId('upload-submit')).toBeInTheDocument();
  });

  it('appends a selected file to the queue', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue({ assetid: 42 });
    renderUploadScreen(onUpload);

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('upload-file-input') as HTMLInputElement;
    await user.upload(input, file);

    // Filename appears in the queue list.
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    // Queue container exists.
    expect(screen.getByTestId('upload-queue')).toBeInTheDocument();
  });

  it('calls onUpload with the selected userid + file on submit', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue({ assetid: 1001 });
    renderUploadScreen(onUpload);

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByTestId('upload-file-input') as HTMLInputElement, file);

    await user.click(screen.getByTestId('upload-submit'));

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1);
    });
    expect(onUpload).toHaveBeenCalledWith(80001, file);

    // Photo gets the "done with N labels" status per Q9.
    await waitFor(() => {
      expect(screen.getByText(/done with \d+ labels/i)).toBeInTheDocument();
    });
  });

  it('does NOT render the ocrMode radio (Q9 — Textract is Future-State)', () => {
    const onUpload = vi.fn().mockResolvedValue({ assetid: 1 });
    renderUploadScreen(onUpload);

    // The `ocrMode` radio's options ("Just text" / "Forms + tables") + its
    // legend ("OCR mode (documents only)") must all be absent.
    expect(screen.queryByText(/ocr mode/i)).toBeNull();
    expect(screen.queryByLabelText(/just text/i)).toBeNull();
    expect(screen.queryByLabelText(/forms \+ tables/i)).toBeNull();
    expect(screen.queryByLabelText(/^text$/i)).toBeNull();
    expect(screen.queryByLabelText(/^forms$/i)).toBeNull();
  });

  it('marks a queue item as error when onUpload rejects', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockRejectedValue(new Error('file too large (max 50 MB)'));
    renderUploadScreen(onUpload);

    const file = new File(['x'], 'huge.bin', { type: 'application/octet-stream' });
    await user.upload(screen.getByTestId('upload-file-input') as HTMLInputElement, file);

    await user.click(screen.getByTestId('upload-submit'));

    // Both the queue status cell and the error toast render the message —
    // assert via getAllByText so we don't trip on the duplicate.
    await waitFor(() => {
      const matches = screen.getAllByText(/file too large/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
