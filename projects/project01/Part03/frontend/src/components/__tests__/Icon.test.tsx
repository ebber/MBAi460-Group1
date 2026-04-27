import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders an icon by name without crashing', () => {
    const { container } = render(<Icon name="search" size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('renders the fallback (Search) for unknown names', () => {
    const { container } = render(<Icon name="this-icon-does-not-exist" size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('passes className through', () => {
    const { container } = render(<Icon name="upload" className="text-accent" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('text-accent')).toBe(true);
  });
});
