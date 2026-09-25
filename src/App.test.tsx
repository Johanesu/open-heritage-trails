import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/CesiumScene', () => ({ default: () => <div data-testid="scene" /> }));
vi.mock('./data/loadDemo', () => ({ loadTrailMetadata: () => new Promise(() => undefined) }));

describe('App', () => {
  it('renders the project identity', () => {
    render(<App />);
    const trailInformation = within(screen.getByRole('complementary', { name: 'Trail information' }));
    expect(trailInformation.getByText('Open Heritage Trails')).toBeInTheDocument();
    expect(trailInformation.getByText(/Shikoku Henro/i)).toBeInTheDocument();
  });
});
