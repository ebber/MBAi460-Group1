// AssetDetail — per-asset page that branches on `asset.kind`.
//
// Phase 5+6 Task 6.3 (subagent D) — component scaffold ONLY. The page takes
// its data via props (asset, previewSrc, labels). Live backend wiring (real
// `getImageFileUrl` / `getImageLabels`) lands in Phase 7.4 — NOT this task.
//
// Per-kind contract (UI workstream §Phase 6 Task 6.3 + DesignDecisions Q9):
//   * `kind === 'photo'`     — image preview (left) + Rekognition labels list
//                              (right), sorted by confidence DESC.
//   * `kind === 'document'`  — PDFs render via <embed type="application/pdf">
//                              with a download-link fallback; non-PDFs render
//                              just the download link. No labels — replaced
//                              by an "OCR coming soon" placeholder.
//   * unknown kind           — graceful "Unknown asset type" fallback (no
//                              crash).
//
// Above the per-kind branch, a header row shows: filename (title), a small
// kind pill, and the assetid as ink-3 metadata.

import type { Asset, Label } from '@/api/types';

export interface AssetDetailProps {
  asset: Asset;
  /** Phase 7.4 wires this to `getImageFileUrl(asset.assetid)`. */
  previewSrc?: string;
  /** Phase 7.4 wires this to `getImageLabels(asset.assetid)`. */
  labels?: Label[];
}

const pillClasses =
  'inline-flex items-center px-2 py-0.5 rounded-full bg-paper-3 ' +
  'text-xs text-ink-2 border border-line';

function AssetHeader({ asset }: { asset: Asset }) {
  return (
    <header
      data-testid="asset-detail-header"
      className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-4"
    >
      <h1
        className="m-0 min-w-0 flex-1 truncate font-serif text-2xl font-medium leading-tight text-ink"
        title={asset.localname}
      >
        {asset.localname}
      </h1>
      <span className={pillClasses} data-testid="asset-kind-badge">
        {asset.kind}
      </span>
      <span className="text-xs text-ink-3" data-testid="asset-id-meta">
        #{asset.assetid}
      </span>
    </header>
  );
}

function PhotoBranch({
  asset,
  previewSrc,
  labels,
}: {
  asset: Asset;
  previewSrc: string | undefined;
  labels: Label[] | undefined;
}) {
  // Sort labels by confidence DESC. Defensive copy — never mutate props.
  const sortedLabels = (labels ?? [])
    .slice()
    .sort((a, b) => b.confidence - a.confidence);

  return (
    <div
      data-testid="asset-detail-photo"
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      <div>
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={asset.localname}
            className="w-full rounded-md border border-line"
          />
        ) : (
          <div
            data-testid="photo-skeleton"
            aria-hidden="true"
            className="w-full aspect-square rounded-md bg-paper-3 animate-shim"
          />
        )}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg text-ink">Labels</h2>
        {sortedLabels.length === 0 ? (
          <p className="text-sm text-ink-3" data-testid="labels-empty">
            No labels
          </p>
        ) : (
          <ul
            data-testid="labels-list"
            className="flex flex-col gap-2"
          >
            {sortedLabels.map((l) => (
              <li
                key={l.label}
                className="flex items-center justify-between rounded-md border border-line bg-paper-2 px-3 py-2"
              >
                <span className="text-sm text-ink">{l.label}</span>
                <span className={pillClasses}>{l.confidence}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DocumentBranch({
  asset,
  previewSrc,
}: {
  asset: Asset;
  previewSrc: string | undefined;
}) {
  const isPdf = asset.localname.toLowerCase().endsWith('.pdf');

  return (
    <div
      data-testid="asset-detail-document"
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      <div className="flex flex-col gap-3">
        {isPdf && previewSrc && (
          <embed
            data-testid="pdf-embed"
            src={previewSrc}
            type="application/pdf"
            className="w-full h-[600px] rounded-md border border-line"
          />
        )}
        {previewSrc ? (
          <a
            href={previewSrc}
            download={asset.localname}
            data-testid="document-download"
            className="text-sm text-accent underline hover:text-accent-2"
          >
            Download {asset.localname}
          </a>
        ) : (
          <p className="text-sm text-ink-3" data-testid="document-no-preview">
            Preview unavailable
          </p>
        )}
      </div>

      <div
        data-testid="ocr-placeholder"
        className="flex flex-col items-center justify-center gap-1 rounded-md border border-line bg-paper-2 p-6 text-center text-ink-2"
      >
        <p className="m-0 font-serif text-lg">OCR coming soon</p>
        <p className="m-0 text-sm">
          Document text extraction is in the Future-State Textract workstream.
        </p>
      </div>
    </div>
  );
}

export function AssetDetail({ asset, previewSrc, labels }: AssetDetailProps) {
  return (
    <section className="px-6 py-6" data-testid="asset-detail">
      <AssetHeader asset={asset} />
      {asset.kind === 'photo' ? (
        <PhotoBranch asset={asset} previewSrc={previewSrc} labels={labels} />
      ) : asset.kind === 'document' ? (
        <DocumentBranch asset={asset} previewSrc={previewSrc} />
      ) : (
        <div
          data-testid="asset-detail-unknown"
          className="rounded-md border border-line bg-paper-2 p-6 text-center text-ink-2"
        >
          <p className="m-0 font-serif text-lg">Unknown asset type</p>
        </div>
      )}
    </section>
  );
}

export default AssetDetail;
