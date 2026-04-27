import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListView } from '../ListView';
import { mockAssets, mockPhotoAsset } from '@/__tests__/fixtures/assets';

describe('ListView', () => {
  it('renders one row per asset and fires onOpenAsset with the asset on click', async () => {
    const user = userEvent.setup();
    const onOpenAsset = vi.fn();

    render(<ListView assets={mockAssets} onOpenAsset={onOpenAsset} />);

    // One row per asset.
    expect(screen.getByTestId(`list-row-${mockAssets[0]!.assetid}`))
      .toBeInTheDocument();
    expect(screen.getByTestId(`list-row-${mockAssets[1]!.assetid}`))
      .toBeInTheDocument();

    await user.click(
      screen.getByTestId(`list-row-${mockPhotoAsset.assetid}`),
    );

    expect(onOpenAsset).toHaveBeenCalledTimes(1);
    expect(onOpenAsset).toHaveBeenCalledWith(mockPhotoAsset);
  });
});
