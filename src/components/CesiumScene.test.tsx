import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CesiumScene from './CesiumScene';

const createViewerMock = vi.hoisted(() => vi.fn());

vi.mock('../cesium/createViewer', () => ({
  createViewer: createViewerMock,
}));

describe('CesiumScene', () => {
  beforeEach(() => {
    createViewerMock.mockReset();
  });

  it('creates one Viewer and destroys it once on unmount', async () => {
    const destroy = vi.fn();
    createViewerMock.mockResolvedValue({ destroy });

    const { unmount } = render(<CesiumScene />);

    await waitFor(() => {
      expect(createViewerMock).toHaveBeenCalledTimes(1);
    });
    expect(createViewerMock).toHaveBeenCalledWith(
      screen.getByTestId('cesium-container'),
    );

    unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('shows a visible error when Viewer creation fails', async () => {
    createViewerMock.mockRejectedValue(
      new Error('Missing VITE_CESIUM_ION_ACCESS_TOKEN'),
    );

    render(<CesiumScene />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Missing VITE_CESIUM_ION_ACCESS_TOKEN',
    );
  });
});
