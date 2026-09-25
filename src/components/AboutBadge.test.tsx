import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutBadge from './AboutBadge';

describe('AboutBadge', () => {
  it('identifies the project and exposes the two destination links', () => {
    render(<AboutBadge />);
    fireEvent.click(screen.getByText('Open Heritage Trails'));

    expect(screen.getByText('Open Heritage Trails')).toBeInTheDocument();
    expect(screen.getByText('Open-source demonstration powered by CesiumJS')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/Johanesu/open-heritage-trails');
    expect(screen.getByRole('link', { name: 'Henro Hub' })).toHaveAttribute('href', 'https://hub.henro.app');
  });
});
