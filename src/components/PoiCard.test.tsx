import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PoiCard from './PoiCard';

describe('PoiCard', () => {
  it('shows the exact record and its optional Henro Hub link, and can close', () => {
    const onClose = vi.fn();
    render(<PoiCard poi={{
      id: 'sdb-101', name: 'Fujii-dera', category: 'temple',
      iconKey: 'temple',
      description: 'Approved description.', henroHubUrl: 'https://henro.app/places/fujii-dera',
    }} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Fujii-dera' })).toBeInTheDocument();
    expect(screen.getByText('temple')).toBeInTheDocument();
    expect(screen.getByText('Approved description.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View in Henro Hub' })).toHaveAttribute(
      'href', 'https://henro.app/places/fujii-dera',
    );
    const close = screen.getByRole('button', { name: 'Close POI details' });
    expect(close).toHaveTextContent('×');
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('omits the link when the approved record has no URL', () => {
    render(<PoiCard poi={{
      id: 'sdb-405', name: 'Pilgrim Rest Area Ryūsui-an', category: 'pilgrim-rest',
      iconKey: 'enclosed-hut',
      description: 'An enclosed pilgrim hut in the forest.',
    }} onClose={() => undefined} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('An enclosed pilgrim hut in the forest.')).toBeInTheDocument();
  });
});
