import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadTrail } from './loadTrail';

const cesiumMocks = vi.hoisted(() => ({
  fromBytes: vi.fn(() => ({ name: 'route-color' })),
  load: vi.fn(),
}));

vi.mock('cesium', () => ({
  Color: { fromBytes: cesiumMocks.fromBytes },
  GeoJsonDataSource: { load: cesiumMocks.load },
}));

describe('loadTrail', () => {
  afterEach(() => vi.clearAllMocks());

  it('loads only the terrain-clamped route, leaving temples to the POI layer', async () => {
    const routeSource = { entities: { values: [] } };
    cesiumMocks.load.mockResolvedValue(routeSource);
    const add = vi.fn().mockResolvedValue(routeSource);
    const viewer = { dataSources: { add } };

    await expect(loadTrail(viewer as never, '/demo/shikoku-henro/t11-t12/trail.geojson'))
      .resolves.toBe(routeSource);

    expect(cesiumMocks.load).toHaveBeenCalledOnce();
    expect(cesiumMocks.load).toHaveBeenCalledWith(
      '/demo/shikoku-henro/t11-t12/trail.geojson',
      { clampToGround: true, stroke: { name: 'route-color' }, strokeWidth: 6 },
    );
    expect(add).toHaveBeenCalledOnce();
    expect(add).toHaveBeenCalledWith(routeSource);
  });
});
