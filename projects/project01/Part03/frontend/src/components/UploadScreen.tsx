// UploadScreen — Phase 6 Task 6.2. Q9 contract: any file accepted, OCR deferred.
//
// Visual contract ported from `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx`
// lines 6–119, with the following Q9 / Q8 adjustments:
//
//   * The drop area + hidden <input type="file" /> accept ANY file type. We
//     do NOT set an `accept=` attribute and we do NOT pre-filter by MIME or
//     extension. The server (multer) enforces only a 50 MB size limit; the
//     server derives `kind` from the filename extension (Q8). Files that
//     exceed 50 MB are rejected at the server with a 400 — the UI surfaces
//     that as a per-item error toast.
//   * The `classify` radio (auto / photo / document) is preserved as a UX
//     hint only. Selection has no server effect in Part 03; it's kept for
//     visual fidelity with Andrew's MVP.
//   * Andrew's `ocrMode` radio (text / forms) is DROPPED entirely. Textract
//     is Future-State; that radio's options have no server-side wiring.
//   * Submission is wired through an `onUpload` prop so component tests can
//     assert call shape without mocking the global fetch. Phase 7.3 wires
//     `photoappApi.uploadImage` into this prop.
//   * Queue display: photos resolve to "done · N labels" (label count is a
//     visual stub for Part 03 — Phase 7.4 will fetch real labels via
//     `getImageLabels` on the asset detail page); documents resolve to
//     "uploaded · stored as document · OCR coming soon" per Q9.

import { useId, useRef, useState } from 'react';

import { Icon } from '@/components/Icon';
import { useToast } from '@/components/ToastProvider';
import type { User } from '@/api/types';
import { fmtBytes } from '@/utils/format';

export interface UploadResult {
  assetid: number;
}

export interface UploadScreenProps {
  users: User[];
  onUpload: (userid: number, file: File) => Promise<UploadResult>;
}

type QueueStatus = 'pending' | 'uploading' | 'done' | 'error';

interface QueueItem {
  id: string;
  file: File;
  status: QueueStatus;
  assetid?: number;
  errorMsg?: string;
}

type Classify = 'auto' | 'photo' | 'document';

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'gif', 'webp']);

function deriveKind(file: File): 'photo' | 'document' {
  // Mirrors the server-side Q8 derivation so the queue display can preview
  // the correct "done" message before the server response confirms it.
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  return IMAGE_EXTS.has(ext) ? 'photo' : 'document';
}

let nextQueueId = 1;
function makeQueueId(): string {
  return `q-${nextQueueId++}`;
}

export function UploadScreen({ users, onUpload }: UploadScreenProps) {
  const { addToast } = useToast();
  const userSelectId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialUserid = users[0]?.userid ?? null;
  const [selectedUserid, setSelectedUserid] = useState<number | null>(initialUserid);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [classify, setClassify] = useState<Classify>('auto');
  const [dragging, setDragging] = useState(false);

  function appendFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setQueue((prev) => [
      ...prev,
      ...list.map((file) => ({ id: makeQueueId(), file, status: 'pending' as const })),
    ]);
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      appendFiles(event.target.files);
    }
    // Reset so selecting the same file again still fires onChange.
    event.target.value = '';
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) {
      appendFiles(event.dataTransfer.files);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  async function handleUploadAll() {
    if (selectedUserid == null) {
      addToast('Pick a user before uploading.', 'warn');
      return;
    }

    const pending = queue.filter((q) => q.status === 'pending');
    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading' } : q)),
      );
      try {
        const result = await onUpload(selectedUserid, item.file);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'done', assetid: result.assetid } : q,
          ),
        );
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'upload failed';
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'error', errorMsg } : q)),
        );
        addToast(errorMsg, 'error');
      }
    }
  }

  const classifyOptions: ReadonlyArray<{ value: Classify; label: string; hint: string }> = [
    { value: 'auto', label: 'Auto-detect', hint: 'Server derives kind from extension' },
    { value: 'photo', label: 'Photo', hint: 'UX hint — server still derives' },
    { value: 'document', label: 'Document', hint: 'UX hint — server still derives' },
  ];

  const pendingCount = queue.filter((q) => q.status === 'pending').length;

  return (
    <section className="flex flex-1 flex-col gap-6 overflow-auto p-6" data-testid="upload-screen">
      {/* User select */}
      <div className="flex items-center gap-3">
        <label htmlFor={userSelectId} className="text-sm font-medium text-ink">
          Upload as:
        </label>
        <select
          id={userSelectId}
          data-testid="upload-user-select"
          className="rounded-md border border-line bg-paper px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
          value={selectedUserid ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedUserid(v === '' ? null : Number(v));
          }}
        >
          {users.length === 0 && <option value="">(no users)</option>}
          {users.map((u) => (
            <option key={u.userid} value={u.userid}>
              {u.givenname} {u.familyname}
            </option>
          ))}
        </select>
      </div>

      {/* Drop area */}
      <div
        data-testid="upload-drop-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        className={[
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragging ? 'border-accent bg-accent-soft' : 'border-line bg-paper-2',
        ].join(' ')}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md border border-line bg-paper text-accent">
          <Icon name="upload" size={22} />
        </div>
        <div className="font-serif text-xl font-medium text-ink">Drag files here or click to select</div>
        <div className="mt-1 text-sm text-ink-2">Any file type · max 50 MB per file</div>
        {/* Hidden file input — note: NO accept attribute, per Q9 (any file accepted). */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          data-testid="upload-file-input"
          aria-label="Select files to upload"
          className="hidden"
          onChange={handleFileInputChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Classify radio (UX hint only — Q9) */}
      <fieldset className="rounded-md border border-line bg-paper p-4">
        <legend className="px-1 text-sm font-medium text-ink">Classify as</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {classifyOptions.map((opt) => (
            <label
              key={opt.value}
              className={[
                'flex flex-1 cursor-pointer items-center gap-2 rounded-sm border px-3 py-2',
                classify === opt.value
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-paper',
              ].join(' ')}
            >
              <input
                type="radio"
                name="classify"
                value={opt.value}
                checked={classify === opt.value}
                onChange={() => setClassify(opt.value)}
                className="accent-accent"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-ink">{opt.label}</span>
                <span className="text-xs text-ink-3">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Queue */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-base font-medium text-ink">Queue</h3>
          <span className="rounded-full border border-line bg-paper-2 px-2 py-0.5 text-xs text-ink-2">
            {queue.length}
          </span>
        </div>
        {queue.length === 0 ? (
          <div className="rounded-md border border-dashed border-line p-6 text-center text-sm text-ink-3">
            No files queued yet.
          </div>
        ) : (
          <ul
            className="overflow-hidden rounded-md border border-line bg-paper"
            data-testid="upload-queue"
          >
            {queue.map((item, idx) => {
              const kind = deriveKind(item.file);
              return (
                <li
                  key={item.id}
                  data-testid={`upload-queue-item-${item.id}`}
                  className={[
                    'flex items-center gap-3 px-4 py-3 text-sm',
                    idx < queue.length - 1 ? 'border-b border-line' : '',
                  ].join(' ')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">{item.file.name}</div>
                    <div className="text-xs text-ink-3">
                      {fmtBytes(item.file.size)} · {kind}
                    </div>
                  </div>
                  <div className="w-44 text-xs text-ink-2" data-testid={`upload-status-${item.id}`}>
                    {renderStatusDetail(item, kind)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.file.name}`}
                    className="text-ink-3 transition-colors hover:text-ink"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUploadAll}
          disabled={pendingCount === 0 || selectedUserid == null}
          data-testid="upload-submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload all
        </button>
        {pendingCount > 0 && (
          <span className="text-xs text-ink-3">
            {pendingCount} file{pendingCount === 1 ? '' : 's'} pending
          </span>
        )}
      </div>
    </section>
  );
}

function renderStatusDetail(item: QueueItem, kind: 'photo' | 'document'): string {
  switch (item.status) {
    case 'pending':
      return 'pending';
    case 'uploading':
      return 'uploading…';
    case 'done':
      // Per Q9: photos report a (simulated) label count; documents call out
      // that OCR is coming in a Future-State workstream.
      if (kind === 'photo') {
        // Simulated label count for Part 03; Phase 7.4 will fetch real
        // labels via getImageLabels on the asset detail page.
        const simulatedLabels = 9;
        return `done with ${simulatedLabels} labels`;
      }
      return 'uploaded · stored as document · OCR coming soon';
    case 'error':
      return item.errorMsg ?? 'upload failed';
  }
}

export default UploadScreen;
