import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPoiRecord, loadPois, validatePoiGeoJson } from './loadPois';

const cesiumMocks = vi.hoisted(() => ({
  fromUrl: vi.fn(async (url: string) => ({ url })),
  load: vi.fn(),
}));

vi.mock('cesium', () => ({
  BillboardGraphics: vi.fn(function BillboardGraphics(options) { return options; }),
  Cartesian2: vi.fn(function Cartesian2(x, y) { return { x, y }; }),
  Color: { BLACK: 'black', WHITE: 'white', fromCssColorString: vi.fn((value: string) => value) },
  GeoJsonDataSource: { load: cesiumMocks.load },
  HeightReference: { CLAMP_TO_GROUND: 'clamp-to-ground' },
  HorizontalOrigin: { CENTER: 'center', LEFT: 'left', RIGHT: 'right' },
  JulianDate: { now: vi.fn(() => 'now') },
  LabelGraphics: vi.fn(function LabelGraphics(options) { return options; }),
  LabelStyle: { FILL_AND_OUTLINE: 'fill-and-outline' },
  PinBuilder: vi.fn(function PinBuilder() { return { fromUrl: cesiumMocks.fromUrl }; }),
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
    expect(collection.features.map((feature) => [feature.properties.name, feature.properties.iconKey])).toEqual([
      ['Fujii-dera', 'temple'],
      ['HENRO HOUSE Oyado Eleven', 'pilgrim-lodging'],
      ['Fujii-dera Okunoin — Dainichi Nyorai Statue', 'daishido'],
      ['Chōto-an', 'daishido'],
      ['The birthplace of landscape', 'semi-enclosed-hut'],
      ['Ryusui-an', 'temple'],
      ['Pilgrim Rest Area Ryūsui-an', 'enclosed-hut'],
      ['Joren-an', 'shrine'],
      ['Joshin-an', 'temple'],
      ['Ryūō-kutsu', 'cave'],
      ['Shōsan-ji', 'temple'],
      ['Zaō-Dai Gongen', 'daishido'],
    ]);
  });

  it.each([
    ['Point geometry', (feature: Record<string, unknown>) => { feature.geometry = { type: 'LineString', coordinates: [] }; }],
    ['id', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).id = ''; }],
    ['name', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).name = ''; }],
    ['category', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).category = 'unknown'; }],
    ['description', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).description = ''; }],
    ['optional URL', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).henroHubUrl = ''; }],
    ['missing icon key', (feature: Record<string, unknown>) => { delete (feature.properties as Record<string, unknown>).iconKey; }],
    ['unknown icon key', (feature: Record<string, unknown>) => { (feature.properties as Record<string, unknown>).iconKey = 'unknown'; }],
  ])('rejects a feature with an invalid %s', (_label, corrupt) => {
    const collection = structuredClone(approved) as { features: Record<string, unknown>[] };
    corrupt(collection.features[0]);

    expect(() => validatePoiGeoJson(collection)).toThrow('Invalid POI GeoJSON');
  });

  it('loads approved features as terrain-visible, glyph-coded category pins', async () => {
    const collection = validatePoiGeoJson(approved);
    const entities = collection.features.map((feature) => ({
      properties: { getValue: () => feature.properties },
      billboard: undefined as unknown,
      label: undefined as undefined | {
        horizontalOrigin: string;
        pixelOffset: { y: number };
        text: string;
      },
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
      image: { url: '/icons/tabler/temple.svg' },
    });
    expect(cesiumMocks.fromUrl.mock.calls.map(([url]) => url)).toEqual(
      expect.arrayContaining([
        '/icons/tabler/temple.svg',
        '/icons/tabler/daishido.svg',
        '/icons/tabler/shrine.svg',
        '/icons/tabler/cave.svg',
        '/icons/tabler/pilgrimlodging.svg',
        '/icons/tabler/enclosedhut.svg',
        '/icons/tabler/semienclosedhut.svg',
      ]),
    );
    expect(entities.every((entity) => entity.label !== undefined)).toBe(true);
    expect(entities[0].label).toMatchObject({
      text: 'T11 Fujii-dera', fillColor: 'white', outlineColor: 'black',
      pixelOffset: { x: expect.any(Number), y: expect.any(Number) },
    });
    expect(entities[10].label).toMatchObject({ text: 'T12 Shōsan-ji' });
    expect(entities[9].label).toMatchObject({ text: 'Ryūō-kutsu' });
    expect(entities[0].label!.pixelOffset.y).toBeLessThan(-40);
    expect(entities[0].label!.horizontalOrigin).toBe('right');
    expect(entities[2].label!.horizontalOrigin).toBe('left');
    expect(entities[2].label!.text).toContain('\n');
    expect(entities[2].label!.text.replaceAll('\n', ' ')).toBe(
      'Fujii-dera Okunoin — Dainichi Nyorai Statue',
    );
  });

  it('exposes only approved card fields from a picked entity', () => {
    const entity = { properties: { getValue: () => ({
      id: 'sdb-101', name: 'Fujii-dera', category: 'temple',
      iconKey: 'temple', description: 'Approved description', internalNote: 'do not expose',
    }) } };

    expect(getPoiRecord(entity as never, 'now' as never)).toEqual({
      id: 'sdb-101', name: 'Fujii-dera', category: 'temple',
      iconKey: 'temple', description: 'Approved description',
    });
  });
});
