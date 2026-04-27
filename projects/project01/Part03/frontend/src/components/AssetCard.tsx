// AssetCard — single tile in the Library grid.
//
// Ports the visual contract from
//   ClaudeDesignDrop/raw/MBAi-460/src/library.jsx
// lines 182–258. Per Q9, photos and documents render differently:
//   * Photo:    thumbnail (`<img src={getImageFileUrl(assetid)}>`) +
//               filename + top-3 labels (with "+N" overflow pill).
//   * Document: large icon (no thumbnail) + filename + kind badge +
//               size + date + an "OCR coming soon" placeholder where
//               labels would appear.
//
// Andrew's MVP cards also surfaced size/date metadata for photos. We
// preserve that for documents (per the spec) and omit it for photos
// (Phase 5 only has fixture data without size/uploaded; live wiring in
// Phase 7.2 can add it back if needed).

import type { Asset, Label } from '@/api/types';
import { Icon } from '@/components/Icon';
import { getImageFileUrl } from '@/api/photoappApi';
import { fmtBytes, fmtDate } from '@/utils/format';

export interface AssetCardProps {
  asset: Asset;
  labels?: Label[];
  onClick: () => void;
  /** Optional document metadata (Phase 7 may pass live values). */
  size?: number;
  uploaded?: Date | string;
}

const cardClasses =
  'block w-full text-left bg-paper-2 border border-line rounded-md p-3 ' +
  'hover:shadow-2 cursor-pointer transition-shadow duration-base ease-ease';

const pillClasses =
  'inline-flex items-center px-2 py-0.5 rounded-full bg-paper-3 ' +
  'text-xs text-ink-2 border border-line';

export function AssetCard({
  asset,
  labels,
  onClick,
  size,
  uploaded,
}: AssetCardProps) {
  const isPhoto = asset.kind === 'photo';
  const visibleLabels = (labels ?? []).slice(0, 3);
  const overflow = (labels ?? []).length - visibleLabels.length;

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`asset-card-${asset.assetid}`}
      data-kind={asset.kind}
      className={cardClasses}
    >
      {isPhoto ? (
        <div className="mb-3 aspect-[4/3] overflow-hidden rounded-sm bg-paper-3">
          <img
            src={getImageFileUrl(asset.assetid)}
            alt={asset.localname}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-sm bg-paper-3 text-ink-3">
          <Icon name="document" size={32} />
        </div>
      )}

      <div
        className="mb-2 truncate text-sm font-medium text-ink"
        title={asset.localname}
      >
        {asset.localname}
      </div>

      {isPhoto ? (
        <div className="flex flex-wrap gap-1">
          {visibleLabels.map((l) => (
            <span key={l.label} className={pillClasses}>
              {l.label}
            </span>
          ))}
          {overflow > 0 && (
            <span className={pillClasses} data-testid="label-overflow">
              +{overflow}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-xs text-ink-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={pillClasses}>document</span>
            {size !== undefined && <span>{fmtBytes(size)}</span>}
            {uploaded !== undefined && <span>{fmtDate(uploaded)}</span>}
          </div>
          <span className="italic" data-testid="ocr-placeholder">
            OCR coming soon
          </span>
        </div>
      )}
    </button>
  );
}

export default AssetCard;
