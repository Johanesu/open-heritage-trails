import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadTrail } from './loadTrail';

const cesiumMocks = vi.hoisted(() => {
  const routeColor = { name: 'route-color' };

  return {
    fromBytes: vi.fn(() => routeColor),
    labelGraphics: vi.fn(function LabelGraphics(options) {
      return options;
    }),
    load: vi.fn(),
    now: vi.fn(() => ({ time: 'now' })),
    routeColor,
  };
});

vi.mock('cesium', () => ({
  Cartesian2: vi.fn(function Cartesian2(x, y) {
    return { x, y };
  }),
  Color: {
    BLACK: { name: 'black' },
    WHITE: { name: 'white' },
    fromBytes: cesiumMocks.fromBytes,
  },
  GeoJsonDataSource: { load: cesiumMocks.load },
  HeightReference: { CLAMP_TO_GROUND: 'clamp-to-ground' },
  JulianDate: { now: cesiumMocks.now },
  LabelGraphics: cesiumMocks.labelGraphics,
  LabelStyle: { FILL_AND_OUTLINE: 'fill-and-outline' },
  VerticalOrigin: { BOTTOM: 'bottom' },
}));

describe('loadTrail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads and styles the terrain-clamped trail and committed endpoints', async () => {
    const routeSource = { entities: { values: [] } };
    const temple11 = {
      properties: { label: { getValue: vi.fn(() => 'T11 Fujiidera') } },
    };
    const temple12 = {
      properties: { label: { getValue: vi.fn(() => 'T12 Shōsanji') } },
    };
    const endpointSource = {
      entities: { values: [temple11, temple12] },
    };
    cesiumMocks.load
      .mockResolvedValueOnce(routeSource)
      .mockResolvedValueOnce(endpointSource);
    const add = vi.fn().mockResolvedValue(undefined);
    const viewer = { dataSources: { add } };

    await expect(
      loadTrail(
        viewer as never,
        '/demo/shikoku-henro/t11-t12/trail.geojson',
      ),
    ).resolves.toBe(routeSource);

    expect(cesiumMocks.fromBytes).toHaveBeenCalledWith(207, 79, 44);
    expect(cesiumMocks.load).toHaveBeenNthCalledWith(
      1,
      '/demo/shikoku-henro/t11-t12/trail.geojson',
      {
        clampToGround: true,
        stroke: cesiumMocks.routeColor,
        strokeWidth: 6,
      },
    );
    expect(cesiumMocks.load).toHaveBeenNthCalledWith(
      2,
      '/demo/shikoku-henro/t11-t12/endpoints.geojson',
      {
        clampToGround: true,
        markerColor: cesiumMocks.routeColor,
        markerSize: 32,
        markerSymbol: '',
      },
    );
    expect(add).toHaveBeenNthCalledWith(1, routeSource);
    expect(add).toHaveBeenNthCalledWith(2, endpointSource);
    expect(temple11).toMatchObject({
      label: expect.objectContaining({ text: 'T11 Fujiidera' }),
    });
    expect(temple12).toMatchObject({
      label: expect.objectContaining({ text: 'T12 Shōsanji' }),
    });
  });
});
