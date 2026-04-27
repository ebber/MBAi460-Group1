import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Library } from '../Library';
import { mockAssets } from '@/__tests__/fixtures/assets';

describe('Library', () => {
  it('renders empty state when assets are empty', () => {
    render(
      <Library assets={[]} onOpenAsset={vi.fn()} onOpenUpload={vi.fn()} />,
    );

    expect(screen.getByText(/No assets yet/i)).toBeInTheDocument();
    expect(screen.getByTestId('empty-library')).toBeInTheDocument();
  });

  it('filters assets by kind when "Photos" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Library
        assets={mockAssets}
        onOpenAsset={vi.fn()}
        onOpenUpload={vi.fn()}
      />,
    );

    // Both assets visible by default
    expect(screen.getByText('01degu.jpg')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Photos/i }));

    expect(screen.getByText('01degu.jpg')).toBeInTheDocument();
    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
  });

  it('calls onSearch with the query when the search button is clicked', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(
      <Library
        assets={[]}
        onOpenAsset={vi.fn()}
        onOpenUpload={vi.fn()}
        onSearch={onSearch}
      />,
    );

    const input = screen.getByLabelText('Search query');
    await user.type(input, 'animal');
    await user.click(screen.getByRole('button', { name: /Search/i }));

    expect(onSearch).toHaveBeenCalledWith('animal');
  });
});
