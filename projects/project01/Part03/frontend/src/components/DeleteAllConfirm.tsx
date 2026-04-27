import { useState } from 'react';
import { Modal } from '@/components/Modal';

interface DeleteAllConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const REQUIRED_PHRASE = 'delete';

export function DeleteAllConfirm({ open, onClose, onConfirm }: DeleteAllConfirmProps) {
  const [confirmText, setConfirmText] = useState('');
  const enabled = confirmText.trim().toLowerCase() === REQUIRED_PHRASE;

  function handleClose() {
    setConfirmText('');
    onClose();
  }

  async function handleConfirm() {
    if (!enabled) return;
    await onConfirm();
    setConfirmText('');
  }

  return (
    <Modal open={open} onClose={handleClose} title="Delete all assets">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-2">
          This permanently deletes every asset (photos and documents) from S3 + every row in the database. This cannot be undone.
        </p>
        <p className="text-sm text-ink-2">
          Type <span className="font-mono bg-paper-3 px-1 rounded-xs">{REQUIRED_PHRASE}</span> to confirm:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-line rounded-md hover:bg-paper-3 transition-colors duration-fast"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!enabled}
            onClick={handleConfirm}
            className="px-4 py-2 bg-error text-accent-fg rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-fast"
          >
            Delete all
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteAllConfirm;
