// EmptyLibrary — friendly empty state for the Library when no assets exist.
//
// Ports the visual contract from
//   ClaudeDesignDrop/raw/MBAi-460/src/library.jsx
// lines 301–321 (`EmptyLibrary`). The decorative SVG illustration is
// replaced with a single Lucide upload icon for MVP simplicity; the copy
// and primary CTA are preserved.

import { Icon } from '@/components/Icon';

export interface EmptyLibraryProps {
  onOpenUpload: () => void;
}

export function EmptyLibrary({ onOpenUpload }: EmptyLibraryProps) {
  return (
    <div
      data-testid="empty-library"
      className="flex flex-col items-center px-5 py-16 text-center"
    >
      <Icon name="upload" size={48} className="text-accent opacity-60" />
      <h2 className="mt-5 font-serif text-xl font-medium text-ink">
        No assets yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">
        Upload a photo or document to get started
      </p>
      <button
        type="button"
        onClick={onOpenUpload}
        className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors duration-base ease-ease hover:bg-accent-2"
      >
        Upload your first asset
      </button>
    </div>
  );
}

export default EmptyLibrary;
