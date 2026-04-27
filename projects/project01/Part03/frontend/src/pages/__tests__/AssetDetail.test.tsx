import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AssetDetail } from '../AssetDetail';
import {
  mockPhotoAsset,
  mockDocumentAsset,
  mockLabels,
} from '@/__tests__/fixtures/assets';
import type { Asset } from '@/api/types';

describe('AssetDetail', () => {
  it('renders a photo asset header, preview image, and labels sorted by confidence DESC', () => {
    render(
      <AssetDetail
        asset={mockPhotoAsset}
        previewSrc="/fake/url"
        labels={mockLabels}
      />,
    );

    // Header surfaces filename + kind pill + id metadata.
    expect(screen.getByText('01degu.jpg')).toBeInTheDocument();
    expect(screen.getByTestId('asset-kind-badge')).toHaveTextContent('photo');
    expect(screen.getByTestId('asset-id-meta')).toHaveTextContent(
      `#${mockPhotoAsset.assetid}`,
    );

    // Image preview is wired to previewSrc with localname as alt text.
    const img = screen.getByRole('img', { name: '01degu.jpg' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/fake/url');

    // Labels list renders both fixture entries; "Animal" (99) sorts above "Dog" (92).
    const list = screen.getByTestId('labels-list');
    expect(list).toBeInTheDocument();
    const items = list.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Animal');
    expect(items[0]).toHaveTextContent('99%');
    expect(items[1]).toHaveTextContent('Dog');
    expect(items[1]).toHaveTextContent('92%');
  });

  it('renders a document (PDF) with an embed + download link and the OCR placeholder, no labels list', () => {
    render(
      <AssetDetail asset={mockDocumentAsset} previewSrc="/fake/test.pdf" />,
    );

    // Filename + kind badge surface in the header.
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('asset-kind-badge')).toHaveTextContent('document');

    // PDF embed is wired with the right MIME type.
    const embed = screen.getByTestId('pdf-embed');
    expect(embed).toBeInTheDocument();
    expect(embed).toHaveAttribute('type', 'application/pdf');
    expect(embed).toHaveAttribute('src', '/fake/test.pdf');

    // Fallback download link points at previewSrc with the localname.
    const link = screen.getByTestId('document-download');
    expect(link).toHaveAttribute('href', '/fake/test.pdf');
    expect(link).toHaveAttribute('download', 'test.pdf');
    expect(link).toHaveTextContent('Download test.pdf');

    // OCR placeholder replaces the labels panel.
    expect(screen.getByTestId('ocr-placeholder')).toHaveTextContent(
      /OCR coming soon/i,
    );

    // No labels list is rendered for documents — and a label name from the
    // photo fixture should be absent (sanity check).
    expect(screen.queryByTestId('labels-list')).not.toBeInTheDocument();
    expect(screen.queryByText('Animal')).not.toBeInTheDocument();
  });

  it('shows a skeleton placeholder when a photo asset is rendered without previewSrc', () => {
    render(<AssetDetail asset={mockPhotoAsset} />);

    // Skeleton stand-in is visible …
    expect(screen.getByTestId('photo-skeleton')).toBeInTheDocument();
    // … and there is no <img> rendered with a broken/empty src.
    expect(screen.queryByRole('img', { name: '01degu.jpg' })).not.toBeInTheDocument();
    // Labels panel still renders (just with the empty placeholder).
    expect(screen.getByTestId('labels-empty')).toHaveTextContent(/no labels/i);
  });

  it('renders a graceful "Unknown asset type" fallback for unsupported kinds', () => {
    const weirdAsset: Asset = {
      assetid: 9999,
      userid: 80001,
      localname: 'mystery.bin',
      bucketkey: 'p_sarkar/mystery.bin',
      // @ts-expect-error - intentionally exercising the fallback branch
      kind: 'video',
    };

    render(<AssetDetail asset={weirdAsset} />);

    expect(screen.getByTestId('asset-detail-unknown')).toHaveTextContent(
      /unknown asset type/i,
    );
    // Per-kind branches must NOT render.
    expect(screen.queryByTestId('asset-detail-photo')).not.toBeInTheDocument();
    expect(screen.queryByTestId('asset-detail-document')).not.toBeInTheDocument();
  });
});
