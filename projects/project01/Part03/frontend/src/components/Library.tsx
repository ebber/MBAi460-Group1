// Library — page-level component that renders the asset gallery.
//
// Ports the visual contract from
//   ClaudeDesignDrop/raw/MBAi-460/src/library.jsx
// lines 1–113 (the `Library` shell, plus its `SegmentedControl` /
// `Dropdown` / `Grid` sub-components inlined as Tailwind elements).
//
// MVP simplifications (per `01-ui-workstream.md` Phase 5 and Q9/Q10):
//   * Search is a Library-page header input (NOT ⌘K). On Enter or
//     Search-button click we call `props.onSearch(query)`. Phase 7.5
//     wires this to `searchImages`; for now the prop is optional and
//     defaults to a no-op so component tests stay green.
//   * Filter segmented control: All | Photos | Documents (local
//     `useState`); the `Sort` dropdown and selection toolbar from
//     Andrew's MVP are deferred.
//   * View toggle: Grid (default) | List, persisted in local state
//     only — `localStorage` persistence is Future-State.
//   * Empty state: render `<EmptyLibrary>` when `emptyState === true`
//     OR `assets.length === 0`. The "no matches" sub-state from the
//     reference is a Future-State polish.

import { useMemo, useState, type FormEvent } from 'react';

import type { Asset, AssetKind, Label } from '@/api/types';
import { AssetCard } from '@/components/AssetCard';
import { EmptyLibrary } from '@/components/EmptyLibrary';
import { Icon } from '@/components/Icon';
import { ListView } from '@/components/ListView';

type Filter = 'all' | AssetKind;
type View = 'grid' | 'list';

export interface LibraryProps {
  assets: Asset[];
  labelsByAssetId?: Record<number, Label[]>;
  onOpenAsset: (asset: Asset) => void;
  onOpenUpload: () => void;
  /** Optional Phase 7.5 hook — no-op default keeps tests simple. */
  onSearch?: (query: string) => void;
  /** Force the empty state for testing / loading shells. */
  emptyState?: boolean;
}

const segmentBtnBase =
  'inline-flex items-center gap-1 rounded-sm px-3 py-1 text-xs font-medium transition-colors duration-base ease-ease';

function segmentBtnClass(active: boolean): string {
  return (
    segmentBtnBase +
    ' ' +
    (active
      ? 'bg-paper text-ink shadow-1 border border-line'
      : 'border border-transparent text-ink-3 hover:text-ink')
  );
}

function viewBtnClass(active: boolean): string {
  return (
    'inline-flex items-center justify-center rounded-sm p-1.5 transition-colors duration-base ease-ease ' +
    (active
      ? 'bg-paper text-ink shadow-1 border border-line'
      : 'border border-transparent text-ink-3 hover:text-ink')
  );
}

export function Library({
  assets,
  labelsByAssetId,
  onOpenAsset,
  onOpenUpload,
  onSearch,
  emptyState,
}: LibraryProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('grid');
  const [query, setQuery] = useState('');

  const filtered = useMemo<Asset[]>(() => {
    if (filter === 'all') return assets;
    return assets.filter((a) => a.kind === filter);
  }, [assets, filter]);

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const showEmpty = emptyState === true || assets.length === 0;

  return (
    <section data-testid="library" className="flex flex-1 flex-col">
      {/* Library page header (search + filters + view toggle) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-paper px-6 py-3">
        <form
          onSubmit={handleSearch}
          role="search"
          aria-label="Search library"
          className="flex flex-1 min-w-[240px] items-center gap-2"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by label..."
            aria-label="Search query"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-md border border-line bg-paper-2 px-3 py-2 text-xs font-medium text-ink-2 transition-colors duration-base ease-ease hover:text-ink"
          >
            <Icon name="search" size={14} />
            Search
          </button>
        </form>

        {/* Filter segmented control */}
        <div
          role="group"
          aria-label="Filter assets by kind"
          className="inline-flex gap-1 rounded-sm border border-line bg-paper-2 p-1"
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={segmentBtnClass(filter === 'all')}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('photo')}
            aria-pressed={filter === 'photo'}
            className={segmentBtnClass(filter === 'photo')}
          >
            <Icon name="photo" size={12} />
            Photos
          </button>
          <button
            type="button"
            onClick={() => setFilter('document')}
            aria-pressed={filter === 'document'}
            className={segmentBtnClass(filter === 'document')}
          >
            <Icon name="document" size={12} />
            Documents
          </button>
        </div>

        {/* View toggle */}
        <div
          role="group"
          aria-label="Toggle library view"
          className="inline-flex gap-1 rounded-sm border border-line bg-paper-2 p-1"
        >
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            className={viewBtnClass(view === 'grid')}
          >
            <Icon name="grid" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            aria-label="List view"
            className={viewBtnClass(view === 'list')}
          >
            <Icon name="list" size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {showEmpty ? (
          <EmptyLibrary onOpenUpload={onOpenUpload} />
        ) : view === 'grid' ? (
          <div
            data-testid="library-grid"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {filtered.map((asset) => (
              <AssetCard
                key={asset.assetid}
                asset={asset}
                labels={labelsByAssetId?.[asset.assetid] ?? []}
                onClick={() => onOpenAsset(asset)}
              />
            ))}
          </div>
        ) : (
          <ListView
            assets={filtered}
            {...(labelsByAssetId !== undefined ? { labelsByAssetId } : {})}
            onOpenAsset={onOpenAsset}
          />
        )}
      </div>
    </section>
  );
}

export default Library;
