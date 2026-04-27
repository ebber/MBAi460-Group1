// ListView — table-like list rendering of Library assets.
//
// Ports the visual contract from
//   ClaudeDesignDrop/raw/MBAi-460/src/library.jsx
// lines 260–299. Andrew's MVP includes a checkbox column + multiple
// metadata columns; the Part 03 MVP keeps the per-row click → open
// behavior and renders icon + filename + kind badge + per-kind hint.
//
// Per Q9: photos show their top label as small text; documents show
// the "OCR coming soon" placeholder.

import type { Asset, Label } from '@/api/types';
import { Icon } from '@/components/Icon';

export interface ListViewProps {
  assets: Asset[];
  labelsByAssetId?: Record<number, Label[]>;
  onOpenAsset: (asset: Asset) => void;
}

const pillClasses =
  'inline-flex items-center px-2 py-0.5 rounded-full bg-paper-3 ' +
  'text-xs text-ink-2 border border-line';

export function ListView({ assets, labelsByAssetId, onOpenAsset }: ListViewProps) {
  return (
    <div
      data-testid="list-view"
      className="overflow-hidden rounded-md border border-line bg-paper-2"
    >
      {assets.map((asset, index) => {
        const isPhoto = asset.kind === 'photo';
        const labels = labelsByAssetId?.[asset.assetid] ?? [];
        const topLabel = labels[0]?.label;
        const isLast = index === assets.length - 1;

        return (
          <button
            key={asset.assetid}
            type="button"
            onClick={() => onOpenAsset(asset)}
            data-testid={`list-row-${asset.assetid}`}
            className={
              'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-base ease-ease hover:bg-paper-3 ' +
              (isLast ? '' : 'border-b border-line')
            }
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-paper-3 text-ink-3">
              <Icon name={isPhoto ? 'photo' : 'document'} size={16} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink" title={asset.localname}>
              {asset.localname}
            </span>
            <span className={pillClasses}>{asset.kind}</span>
            <span
              className="hidden min-w-0 max-w-[40%] flex-shrink truncate text-xs text-ink-3 sm:block"
              data-testid={`list-row-hint-${asset.assetid}`}
            >
              {isPhoto
                ? (topLabel ?? '—')
                : 'OCR coming soon'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ListView;
