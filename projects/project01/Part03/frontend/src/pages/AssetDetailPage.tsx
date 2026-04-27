import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AssetDetail } from '@/pages/AssetDetail';
import { getImages, getImageLabels, getImageFileUrl } from '@/api/photoappApi';
import type { Asset, Label } from '@/api/types';

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const assetid = id !== undefined ? Number.parseInt(id, 10) : Number.NaN;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [labels, setLabels] = useState<Label[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (Number.isNaN(assetid)) {
      setError('Invalid asset id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getImages()
      .then(async (rows) => {
        if (cancelled) return;
        const found = rows.find((r) => r.assetid === assetid);
        if (!found) {
          setError('Asset not found');
          return;
        }
        setAsset(found);
        if (found.kind === 'photo') {
          try {
            const ls = await getImageLabels(assetid);
            if (!cancelled) setLabels(ls);
          } catch {
            if (!cancelled) setLabels([]);
          }
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'failed to load asset');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assetid]);

  if (loading) {
    return (
      <div className="p-8" data-testid="asset-detail-loading">
        <div className="animate-shim bg-paper-3 h-6 w-48 rounded-md" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-8" data-testid="asset-detail-error">
        <p className="text-error">{error ?? 'Asset not available'}</p>
        <Link to="/library" className="text-accent underline">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <AssetDetail
      asset={asset}
      previewSrc={getImageFileUrl(asset.assetid)}
      {...(labels !== undefined ? { labels } : {})}
    />
  );
}

export default AssetDetailPage;
