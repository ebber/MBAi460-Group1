import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AssetCard } from '../AssetCard';
import {
  mockPhotoAsset,
  mockDocumentAsset,
  mockLabels,
} from '@/__tests__/fixtures/assets';
import type { Label } from '@/api/types';

describe('AssetCard', () => {
  it('renders top labels for a photo asset (≤3 visible) and shows the +N overflow pill', () => {
    const fourLabels: Label[] = [
      ...mockLabels,
      { label: 'Mammal', confidence: 88 },
      { label: 'Pet', confidence: 70 },
    ];
    render(
      <AssetCard
        asset={mockPhotoAsset}
        labels={fourLabels}
        onClick={vi.fn()}
      />,
    );

    // Top 3 labels are visible.
    expect(screen.getByText('Animal')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Mammal')).toBeInTheDocument();
    // 4th label is hidden (folded into +N pill).
    expect(screen.queryByText('Pet')).not.toBeInTheDocument();
    // +N overflow pill is rendered.
    expect(screen.getByTestId('label-overflow')).toHaveTextContent('+1');
  });

  it('renders document kind badge and OCR placeholder for a document asset', () => {
    render(
      <AssetCard
        asset={mockDocumentAsset}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('document')).toBeInTheDocument();
    expect(screen.getByTestId('ocr-placeholder')).toHaveTextContent(
      /OCR coming soon/i,
    );
  });

  it('fires onClick when the card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <AssetCard
        asset={mockPhotoAsset}
        labels={mockLabels}
        onClick={onClick}
      />,
    );

    await user.click(screen.getByTestId(`asset-card-${mockPhotoAsset.assetid}`));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
