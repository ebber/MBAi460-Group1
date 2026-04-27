import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library } from '@/components/Library';
import { DeleteAllConfirm } from '@/components/DeleteAllConfirm';
import { useToast } from '@/components/ToastProvider';
import { getImages, getImageLabels, searchImages, deleteAllImages } from '@/api/photoappApi';
import type { Asset, Label } from '@/api/types';

export function LibraryPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [labelsByAssetId, setLabelsByAssetId] = useState<Record<number, Label[]>>({});
  const [searchHits, setSearchHits] = useState<Set<number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getImages()
      .then(async (rows) => {
        if (cancelled) return;
        setAssets(rows);
        // Best-effort label fetch for the photos visible in the grid.
        // Failures are non-blocking; the labels panel just won't populate.
        const photos = rows.filter((a) => a.kind === 'photo');
        const labelEntries = await Promise.all(
          photos.map(async (a) => {
            try {
              const labels = await getImageLabels(a.assetid);
              return [a.assetid, labels] as const;
            } catch {
              return [a.assetid, [] as Label[]] as const;
            }
          }),
        );
        if (cancelled) return;
        const labelsMap: Record<number, Label[]> = {};
        for (const [id, labels] of labelEntries) labelsMap[id] = labels;
        setLabelsByAssetId(labelsMap);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'failed to load library');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const visibleAssets = useMemo(() => {
    if (searchHits === null) return assets;
    return assets.filter((a) => searchHits.has(a.assetid));
  }, [assets, searchHits]);

  async function handleSearch(query: string) {
    const trimmed = query.trim();
    if (trimmed === '') {
      setSearchHits(null);
      return;
    }
    try {
      const hits = await searchImages(trimmed);
      setSearchHits(new Set(hits.map((h) => h.assetid)));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'search failed';
      addToast(msg, 'error');
    }
  }

  async function handleConfirmDelete() {
    try {
      await deleteAllImages();
      addToast('All assets deleted', 'success');
      setDeleteConfirmOpen(false);
      setReloadCount((n) => n + 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'delete failed';
      addToast(msg, 'error');
    }
  }

  if (loading) {
    return (
      <div className="p-8" data-testid="library-loading">
        <div className="animate-shim bg-paper-3 h-6 w-48 rounded-md mb-4" />
        <div className="animate-shim bg-paper-3 h-32 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8" data-testid="library-error">
        <p className="text-error">Failed to load library: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-3 flex justify-end border-b border-line">
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="text-sm text-error border border-line rounded-md px-3 py-1 hover:bg-error/10 transition-colors duration-fast"
        >
          Delete all
        </button>
      </div>
      <Library
        assets={visibleAssets}
        labelsByAssetId={labelsByAssetId}
        onOpenAsset={(asset) => navigate(`/asset/${asset.assetid}`)}
        onOpenUpload={() => navigate('/upload')}
        onSearch={handleSearch}
      />
      <DeleteAllConfirm
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default LibraryPage;
