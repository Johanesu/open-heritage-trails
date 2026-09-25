import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PoiLegend from './PoiLegend';

describe('PoiLegend', () => {
  it('shows all seven actual glyphs with readable meanings', () => {
    render(<PoiLegend />);
    fireEvent.click(screen.getByText('POI legend'));

    for (const [name, path] of [
      ['Temple', 'temple.svg'],
      ['Daishi-dō', 'daishido.svg'],
      ['Shrine', 'shrine.svg'],
      ['Cave / Rock', 'cave.svg'],
      ['Pilgrim lodging', 'pilgrimlodging.svg'],
      ['Enclosed hut', 'enclosedhut.svg'],
      ['Semi-enclosed hut', 'semienclosedhut.svg'],
    ] as const) {
      expect(screen.getByRole('img', { name })).toHaveAttribute('src', `/icons/henro-hub/${path}`);
    }
  });
});
