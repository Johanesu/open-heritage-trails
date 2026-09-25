import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TrailMetadata } from '../types/trail';
import TrailPanel from './TrailPanel';

const metadata: TrailMetadata = {
  id: 'shikoku-henro-t11-t12',
  title: 'Shikoku Henro: Temple 11 Fujiidera → Temple 12 Shōsanji',
  subtitle: 'First Henro-korogashi mountain section',
  from: { id: 'temple-11', name: 'Fujiidera', templeNumber: 11 },
  to: { id: 'temple-12', name: 'Shōsanji', templeNumber: 12 },
  distanceM: 11614.2,
  ascentM: 1548,
  descentM: 894,
  minElevationM: 31,
  maxElevationM: 759,
  sourceAttribution: '© OpenStreetMap contributors',
  dataLicense: 'ODbL-1.0',
};

describe('TrailPanel', () => {
  it('shows the committed trail identity, statistics, and source', () => {
    render(<TrailPanel metadata={metadata} />);

    expect(screen.getByText('Open Heritage Trails')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: metadata.title })).toBeInTheDocument();
    expect(screen.getByText(metadata.subtitle)).toBeInTheDocument();
    expect(screen.getByText('T11 Fujiidera')).toBeInTheDocument();
    expect(screen.getByText('T12 Shōsanji')).toBeInTheDocument();
    expect(screen.getByText('11.6 km')).toBeInTheDocument();
    expect(screen.getByText('1,548 m')).toBeInTheDocument();
    expect(screen.getByText('894 m')).toBeInTheDocument();
    expect(screen.getByText('31 m')).toBeInTheDocument();
    expect(screen.getByText('759 m')).toBeInTheDocument();
    expect(screen.getByText('© OpenStreetMap contributors')).toBeInTheDocument();
  });
});
