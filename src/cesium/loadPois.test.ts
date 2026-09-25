import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPoiRecord, loadPois, validatePoiGeoJson } from './loadPois';

const cesiumMocks = vi.hoisted(() => ({
  fromText: vi.fn((letter: string) => ({ letter })),
  load: vi.fn(),
}));

vi.mock('cesium', () => ({
  BillboardGraphics: vi.fn(function BillboardGraphics(options) { return options; }),
  Color: { fromCssColorString: vi.fn((value: string) => value) },
  GeoJsonDataSource: { load: cesiumMocks.load },
  HeightReference: { CLAMP_TO_GROUND: 'clamp-to-ground' },
  JulianDate: { now: vi.fn(() => 'now') },
  PinBuilder: vi.fn(function PinBuilder() { return { fromText: cesiumMocks.fromText }; }),
  VerticalOrigin: { BOTTOM: 'bottom' },
}));

const approved = JSON.parse(readFileSync(
  'public/demo/shikoku-henro/t11-t12/pois.geojson',
  'utf8',
)) as unknown;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('POI GeoJSON', () => {
  it('accepts the 12 committed records without merging distinct nearby places', () => {
    const collection = validatePoiGeoJson(approved);

    expect(collection.features).toHaveLength(12);
    expect(collection.features.map((feature) => feature.properties.name)).toContain('Ryusui-an');
    expect(collection.features.map((feature) => feature.properties.name)).toContain('Pilgrim Rest Area Ryūsui-an');
    expect(collection.features.map((feature) => feature.properties.name)).toContain('Zaō-Dai Gongen');
  });

  it.each([
    ['Point geometry', (feature: Record<string, unknown>) => { feature.geometry = { type: 'LineString', coordinates: [] }; }],
    ['id', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).id = ''; }],
    ['name', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).name = ''; }],
    ['category', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).category = 'unknown'; }],
    ['description', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).description = ''; }],
    ['optional URL', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).henroHubUrl = ''; }],
  ])('rejects a feature with an invalid %s', (_label, corrupt) => {
    const collection = structuredClone(approved) as { features: Record<string, unknown>[] };
    corrupt(collection.features[0]);

    expect(() => validatePoiGeoJson(collection)).toThrow('Invalid POI GeoJSON');
  });

  it('loads approved features as terrain-visible, letter-coded category pins', async () => {
    const collection = validatePoiGeoJson(approved);
    const entities = collection.features.map((feature) => ({
      properties: { getValue: () => feature.properties },
      billboard: undefined as unknown,
    }));
    const source = { entities: { values: entities } };
    cesiumMocks.load.mockResolvedValue(source);
    const add = vi.fn().mockResolvedValue(source);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => approved }));

    await expect(loadPois({ dataSources: { add } } as never,
      '/demo/shikoku-henro/t11-t12/pois.geojson')).resolves.toBe(source);

    expect(cesiumMocks.load).toHaveBeenCalledWith(collection, { clampToGround: true });
    expect(add).toHaveBeenCalledWith(source);
    expect(entities.every((entity) => entity.billboard !== undefined)).toBe(true);
    expect(entities[0].billboard).toMatchObject({
      heightReference: 'clamp-to-ground',
      disableDepthTestDistance: Infinity,
      image: { letter: 'T' },
    });
    expect(cesiumMocks.fromText.mock.calls.map(([letter]) => letter)).toEqual(
      expect.arrayContaining(['T', 'S', 'R', 'A', 'V']),
    );
  });

  it('exposes only approved card fields from a picked entity', () => {
    const entity = { properties: { getValue: () => ({
      id: 'sdb-101', name: 'Fujii-dera', category: 'temple',
      description: 'Approved description', internalNote: 'do not expose',
    }) } };

    expect(getPoiRecord(entity as never, 'now' as never)).toEqual({
      id: 'sdb-101', name: 'Fujii-dera', category: 'temple',
      description: 'Approved description',
    });
  });
});
