import { describe, expect, it, vi } from 'vitest';
import { fitTrail, flyToEndpoint } from './camera';

const cesiumMocks = vi.hoisted(() => ({
  fromDegrees: vi.fn((longitude, latitude, height) => ({
    height,
    latitude,
    longitude,
  })),
  headingPitchRange: vi.fn(function HeadingPitchRange(
    heading,
    pitch,
    range,
  ) {
    return { heading, pitch, range };
  }),
  toRadians: vi.fn((degrees) => (degrees * Math.PI) / 180),
}));

vi.mock('cesium', () => ({
  Cartesian3: { fromDegrees: cesiumMocks.fromDegrees },
  HeadingPitchRange: cesiumMocks.headingPitchRange,
  Math: { toRadians: cesiumMocks.toRadians },
}));

describe('camera helpers', () => {
  it('fits the route with an oblique terrain view', async () => {
    const flyTo = vi.fn().mockResolvedValue(true);
    const viewer = { flyTo };
    const source = { name: 'trail' };

    await fitTrail(viewer as never, source as never);

    expect(flyTo).toHaveBeenCalledWith(source, {
      duration: 1.5,
      offset: {
        heading: (20 * Math.PI) / 180,
        pitch: (-35 * Math.PI) / 180,
        range: 0,
      },
    });
  });

  it('flies to an endpoint and resolves when the flight completes', async () => {
    const flyTo = vi.fn((options) => options.complete());
    const viewer = { camera: { flyTo } };

    await flyToEndpoint(viewer as never, 134.348913, 34.0515933, 1_200);

    expect(cesiumMocks.fromDegrees).toHaveBeenCalledWith(
      134.348913,
      34.0515933,
      1_200,
    );
    expect(flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: {
          height: 1_200,
          latitude: 34.0515933,
          longitude: 134.348913,
        },
        duration: 1.5,
        orientation: {
          heading: 0,
          pitch: (-45 * Math.PI) / 180,
          roll: 0,
        },
      }),
    );
  });
});
