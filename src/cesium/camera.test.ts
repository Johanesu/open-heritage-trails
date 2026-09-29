import { describe, expect, it, vi } from 'vitest';
import { fitTrail, flyToEndpoint, focusEndpoint2D, playTrailIntro, waitForGlobeReady } from './camera';

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
  Cartesian2: vi.fn(function Cartesian2(x, y) { return { x, y }; }),
  Cartesian3: { fromDegrees: cesiumMocks.fromDegrees, fromRadians: cesiumMocks.fromRadians },
  Cartographic: { fromCartesian: (point: { longitude: number; latitude: number }) => ({
    longitude: point.longitude * Math.PI / 180,
    latitude: point.latitude * Math.PI / 180,
  }) },
  HeadingPitchRange: cesiumMocks.headingPitchRange,
  Math: { toRadians: cesiumMocks.toRadians },
  Rectangle: { fromCartesianArray: vi.fn(() => ({ west: 1, south: 2, east: 3, north: 4 })) },
  SceneMode: { SCENE2D: 2, SCENE3D: 3 },
  sampleTerrainMostDetailed: cesiumMocks.sampleTerrain,
}));

const route = Array.from({ length: 41 }, (_, index) => ({
  longitude: 134.35 - index * 0.001,
  latitude: 34.05 - index * 0.0015,
}));
const source = { entities: { values: [{ polyline: { positions: { getValue: () => route } } }] } };

describe('camera helpers', () => {
  it('fits the whole route looking from T11 toward T12', async () => {
    const flyTo = vi.fn().mockResolvedValue(true);
    const viewer = { flyTo, scene: { mode: 3 }, clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 } };

    await fitTrail(viewer as never, source as never);

    expect(flyTo).toHaveBeenCalledWith(source, {
      duration: 1.5,
      offset: expect.objectContaining({ pitch: (-35 * Math.PI) / 180, range: expect.any(Number) }),
    });
    expect(flyTo.mock.calls[0][1].offset.heading).toBeGreaterThan(Math.PI);
    expect(flyTo.mock.calls[0][1].offset.heading).toBeLessThan(5 * Math.PI / 4);
    expect(flyTo.mock.calls[0][1].offset.range).toBeGreaterThan(500);
    expect(flyTo.mock.calls[0][1].offset.range).toBeLessThan(2000);
  });

  it('fits the geographic route bounds directly in 2D', async () => {
    const flyTo = vi.fn();
    const cameraFlyTo = vi.fn((options) => options.complete());
    const viewer = {
      flyTo, camera: { flyTo: cameraFlyTo }, scene: { mode: 2 }, clock: { currentTime: 'now' },
      canvas: { clientWidth: 1200, clientHeight: 800 },
    };

    await fitTrail(viewer as never, source as never);

    expect(flyTo).not.toHaveBeenCalled();
    expect(cameraFlyTo.mock.calls[0][0].destination).toEqual({
      west: 0.6, south: 1.6, east: 3.4, north: 4.4,
    });
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

  it('centers a temple segment top-down in 2D', async () => {
    const flyToBoundingSphere = vi.fn((_, options) => options.complete());
    const viewer = { camera: { flyToBoundingSphere } };

    await focusEndpoint2D(viewer as never, route as never, true);

    const [sphere, options] = flyToBoundingSphere.mock.calls[0];
    expect(sphere.radius).toBe(500);
    expect(options.offset.heading).toBe(0);
    expect(options.offset.pitch).toBe(-Math.PI / 2);
  });

  it('waits for two rendered frames with loaded globe tiles', async () => {
    let render: (() => void) | undefined;
    const remove = vi.fn();
    const scene = {
      globe: { tilesLoaded: false, pick: vi.fn(() => ({})) },
      canvas: { clientWidth: 1200, clientHeight: 800 },
      camera: { getPickRay: vi.fn(() => 'ray') },
      postRender: { addEventListener: vi.fn((callback) => { render = callback; return remove; }) },
    };
    const ready = waitForGlobeReady(scene as never, 1000);
    render!();
    scene.globe.tilesLoaded = true;
    render!();
    render!();

    await expect(ready).resolves.toBe(true);
    expect(remove).toHaveBeenCalledOnce();
  });

  it('does not treat an empty tile queue as a visible globe surface', async () => {
    vi.useFakeTimers();
    let render: (() => void) | undefined;
    const scene = {
      globe: { tilesLoaded: true, pick: vi.fn(() => undefined) },
      canvas: { clientWidth: 1200, clientHeight: 800 },
      camera: { getPickRay: vi.fn(() => 'ray') },
      postRender: { addEventListener: vi.fn((callback) => { render = callback; return vi.fn(); }) },
    };

    try {
      const ready = waitForGlobeReady(scene as never, 100);
      render!();
      render!();
      await vi.advanceTimersByTimeAsync(100);
      await expect(ready).resolves.toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not reveal trail data when globe rendering never becomes visible', async () => {
    vi.useFakeTimers();
    const reveal = vi.fn();
    const viewer = {
      scene: {
        globe: { tilesLoaded: false, pick: vi.fn(() => undefined) },
        canvas: { clientWidth: 1200, clientHeight: 800 },
        camera: { getPickRay: vi.fn(() => 'ray') },
        postRender: { addEventListener: vi.fn(() => vi.fn()) },
      },
      camera: {
        setView: vi.fn(),
        flyTo: vi.fn((options) => options.complete()),
      },
      clock: { currentTime: 'now' },
      canvas: { clientWidth: 1200, clientHeight: 800 },
      flyTo: vi.fn().mockResolvedValue(true),
    };

    try {
      const result = playTrailIntro(viewer as never, source as never, false, reveal)
        .then(() => 'resolved', (error: unknown) => error);
      await vi.advanceTimersByTimeAsync(8_000);
      expect(await result).toEqual(new Error('Cesium globe did not become visible'));
      expect(reveal).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('waits for a slow first globe surface instead of failing at the old short timeout', async () => {
    vi.useFakeTimers();
    let render: (() => void) | undefined;
    let visible = false;
    const viewer = {
      scene: {
        globe: { tilesLoaded: true, pick: vi.fn(() => visible ? {} : undefined) },
        canvas: { clientWidth: 1200, clientHeight: 800 },
        camera: { getPickRay: vi.fn(() => 'ray') },
        postRender: { addEventListener: vi.fn((callback) => {
          render = callback;
          if (visible) queueMicrotask(() => { callback(); callback(); });
          return vi.fn();
        }) },
      },
      camera: { setView: vi.fn(), flyTo: vi.fn((options) => options.complete()) },
      clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 },
      flyTo: vi.fn().mockResolvedValue(true),
    };

    try {
      const result = playTrailIntro(viewer as never, source as never, false)
        .then(() => 'completed', (error: unknown) => error);
      await vi.advanceTimersByTimeAsync(3_000);
      visible = true;
      render!();
      render!();
      await vi.advanceTimersByTimeAsync(1_000);
      expect(await result).toBe('completed');
    } finally {
      vi.useRealTimers();
    }
  });

  it('starts at the globe, flies toward Shikoku, then settles on the route', async () => {
    vi.useFakeTimers();
    const order: string[] = [];
    const viewer = {
      clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 },
      flyTo: vi.fn().mockImplementation(async () => { order.push('route'); return true; }),
      scene: { globe: { tilesLoaded: true, pick: vi.fn(() => ({})) },
        canvas: { clientWidth: 1200, clientHeight: 800 },
        camera: { getPickRay: vi.fn(() => 'ray') },
        postRender: { addEventListener: vi.fn((callback) => {
        queueMicrotask(() => { callback(); callback(); });
        return vi.fn();
      }) } },
      camera: {
        setView: vi.fn((_options: { destination: { height: number } }) => order.push('globe')),
        flyTo: vi.fn((options) => { order.push('Shikoku'); options.complete(); }),
      },
    };

    try {
      const intro = playTrailIntro(viewer as never, source as never, false, () => order.push('reveal'));
      await vi.advanceTimersByTimeAsync(0);
      expect(order).toEqual(['globe']);
      expect(viewer.camera.setView.mock.calls[0][0].destination.height).toBeGreaterThanOrEqual(24_000_000);
      await vi.advanceTimersByTimeAsync(900);
      expect(order).toEqual(['globe']);
      await vi.advanceTimersByTimeAsync(200);
      await intro;

      expect(order).toEqual(['globe', 'Shikoku', 'reveal', 'route']);
      expect(viewer.flyTo.mock.calls[0][1].duration).toBeGreaterThan(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('skips the globe and flight when reduced motion is requested', async () => {
    const viewer = {
      clock: { currentTime: 'now' }, canvas: { clientWidth: 1200, clientHeight: 800 },
      flyTo: vi.fn().mockResolvedValue(true),
      scene: { globe: { tilesLoaded: true, pick: vi.fn(() => ({})) },
        canvas: { clientWidth: 1200, clientHeight: 800 },
        camera: { getPickRay: vi.fn(() => 'ray') },
        postRender: { addEventListener: vi.fn((callback) => {
        queueMicrotask(() => { callback(); callback(); });
        return vi.fn();
      }) } },
      camera: { setView: vi.fn(), flyTo: vi.fn() },
    };

    const reveal = vi.fn();
    await playTrailIntro(viewer as never, source as never, true, reveal);

    expect(viewer.camera.setView).not.toHaveBeenCalled();
    expect(viewer.camera.flyTo).not.toHaveBeenCalled();
    expect(viewer.flyTo.mock.calls[0][1].duration).toBe(0);
    expect(reveal).toHaveBeenCalledOnce();
  });
});
