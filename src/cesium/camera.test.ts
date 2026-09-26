import { describe, expect, it, vi } from 'vitest';
import { fitTrail, flyToEndpoint, playTrailIntro } from './camera';

const cesiumMocks = vi.hoisted(() => ({
  fromDegrees: vi.fn((longitude, latitude, height) => ({ longitude, latitude, height })),
  fromRadians: vi.fn((longitude, latitude, height) => ({ longitude, latitude, height })),
  fromPoints: vi.fn((positions) => ({ center: positions[Math.floor(positions.length / 2)], radius: 500 })),
  headingPitchRange: vi.fn(function HeadingPitchRange(heading, pitch, range) {
    return { heading, pitch, range };
  }),
  toRadians: vi.fn((degrees) => (degrees * Math.PI) / 180),
  sampleTerrain: vi.fn(async (_provider, positions) => positions.map((position: object) => ({ ...position, height: 700 }))),
}));

vi.mock('cesium', () => ({
  BoundingSphere: { fromPoints: cesiumMocks.fromPoints },
  Cartesian3: { fromDegrees: cesiumMocks.fromDegrees, fromRadians: cesiumMocks.fromRadians },
  Cartographic: { fromCartesian: (point: { longitude: number; latitude: number }) => ({
    longitude: point.longitude * Math.PI / 180,
    latitude: point.latitude * Math.PI / 180,
  }) },
  HeadingPitchRange: cesiumMocks.headingPitchRange,
  Math: { toRadians: cesiumMocks.toRadians },
  sampleTerrainMostDetailed: cesiumMocks.sampleTerrain,
}));

const route = Array.from({ length: 41 }, (_, index) => ({
  longitude: 134.35 - index * 0.001,
  latitude: 34.05 - index * 0.0015,
}));
const source = { entities: { values: [{ polyline: { positions: { getValue: () => route } } }] } };

describe('camera helpers', () => {
  it('fits the whole route with an explicit, closer oblique range', async () => {
    const flyTo = vi.fn().mockResolvedValue(true);
    const viewer = { flyTo, clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 } };

    await fitTrail(viewer as never, source as never);

    expect(flyTo).toHaveBeenCalledWith(source, {
      duration: 1.5,
      offset: expect.objectContaining({ pitch: (-35 * Math.PI) / 180, range: expect.any(Number) }),
    });
    expect(flyTo.mock.calls[0][1].offset.range).toBeGreaterThan(500);
    expect(flyTo.mock.calls[0][1].offset.range).toBeLessThan(2000);
  });

  it('looks from T11 down the first route section, with T11 in the foreground', async () => {
    const flyToBoundingSphere = vi.fn((_, options) => options.complete());
    const viewer = { camera: { flyToBoundingSphere } };

    await flyToEndpoint(viewer as never, route as never, false);

    const [sphere, options] = flyToBoundingSphere.mock.calls[0];
    expect(cesiumMocks.sampleTerrain.mock.calls.at(-1)?.[1]).toHaveLength(21);
    expect(cesiumMocks.fromPoints.mock.calls.at(-1)?.[0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 700 })]),
    );
    expect(sphere.radius).toBe(500);
    expect(options.offset.heading).toBeGreaterThan(Math.PI);
    expect(options.offset.heading).toBeLessThan(5 * Math.PI / 4);
    expect(options.offset.pitch).toBeLessThan(0);
    expect(options.offset.range).toBeGreaterThan(500);
  });

  it('looks from T12 back along the last route section', async () => {
    const flyToBoundingSphere = vi.fn((_, options) => options.complete());
    const viewer = { camera: { flyToBoundingSphere } };

    await flyToEndpoint(viewer as never, route as never, true);

    expect(cesiumMocks.sampleTerrain.mock.calls.at(-1)?.[1]).toHaveLength(21);
    expect(cesiumMocks.sampleTerrain.mock.calls.at(-1)?.[1][20].latitude)
      .toBeCloseTo(route.at(-1)!.latitude * Math.PI / 180);
    const heading = flyToBoundingSphere.mock.calls[0][1].offset.heading;
    expect(heading).toBeGreaterThan(0);
    expect(heading).toBeLessThan(Math.PI / 2);
  });

  it('starts at the globe, flies toward Shikoku, then settles on the route', async () => {
    const order: string[] = [];
    const viewer = {
      clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 },
      flyTo: vi.fn().mockImplementation(async () => { order.push('route'); return true; }),
      camera: {
        setView: vi.fn(() => order.push('globe')),
        flyTo: vi.fn((options) => { order.push('Shikoku'); options.complete(); }),
      },
    };

    await playTrailIntro(viewer as never, source as never, false);

    expect(order).toEqual(['globe', 'Shikoku', 'route']);
    expect(viewer.flyTo.mock.calls[0][1].duration).toBeGreaterThan(0);
  });

  it('skips the globe and flight when reduced motion is requested', async () => {
    const viewer = {
      clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 },
      flyTo: vi.fn().mockResolvedValue(true),
      camera: { setView: vi.fn(), flyTo: vi.fn() },
    };

    await playTrailIntro(viewer as never, source as never, true);

    expect(viewer.camera.setView).not.toHaveBeenCalled();
    expect(viewer.camera.flyTo).not.toHaveBeenCalled();
    expect(viewer.flyTo.mock.calls[0][1].duration).toBe(0);
  });
});
