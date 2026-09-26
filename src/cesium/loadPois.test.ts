import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPoiRecord, loadPois, setPoiLabelVisibility, setPoiSceneMode, validatePoiGeoJson } from './loadPois';

const cesiumMocks = vi.hoisted(() => ({
  fromUrl: vi.fn(async (url: string, _color: unknown, _size: number) => ({ url })),
  load: vi.fn(),
}));

vi.mock('cesium', () => ({
  BillboardGraphics: vi.fn(function BillboardGraphics(options) { return options; }),
  Cartesian2: vi.fn(function Cartesian2(x, y) { return { x, y }; }),
  Color: { BLACK: 'black', WHITE: 'white', fromCssColorString: vi.fn((value: string) => value) },
  ConstantProperty: vi.fn(function ConstantProperty(value) { return { getValue: () => value }; }),
  GeoJsonDataSource: { load: cesiumMocks.load },
  HeightReference: { CLAMP_TO_GROUND: 'clamp-to-ground', NONE: 'none' },
  HorizontalOrigin: { CENTER: 'center', LEFT: 'left', RIGHT: 'right' },
  JulianDate: { now: vi.fn(() => 'now') },
  LabelGraphics: vi.fn(function LabelGraphics(options) { return options; }),
  LabelStyle: { FILL_AND_OUTLINE: 'fill-and-outline' },
  PinBuilder: vi.fn(function PinBuilder() { return { fromUrl: cesiumMocks.fromUrl }; }),
  SceneMode: { SCENE2D: 2, SCENE3D: 3 },
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
        pixelOffset: { x: number; y: number };
        text: string;
        heightReference: string;
        show: { getValue: () => boolean };
      },
    }));
    const source = { show: true, entities: { values: entities } };
    cesiumMocks.load.mockResolvedValue(source);
    const add = vi.fn().mockResolvedValue(source);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => approved }));

    await expect(loadPois({ dataSources: { add } } as never,
      '/demo/shikoku-henro/t11-t12/pois.geojson', true)).resolves.toBe(source);

    expect(cesiumMocks.load).toHaveBeenCalledWith(collection, { clampToGround: true });
    expect(add).toHaveBeenCalledWith(source);
    expect(source.show).toBe(false);
    expect(entities.every((entity) => entity.billboard !== undefined)).toBe(true);
    expect(entities[0].billboard).toMatchObject({
      heightReference: 'clamp-to-ground',
      disableDepthTestDistance: Infinity,
      image: { url: '/icons/tabler/temple.svg' },
      scale: 44 / 128,
    });
    expect(cesiumMocks.fromUrl.mock.calls[0][2]).toBe(128);
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
    expect(entities[0].label!.pixelOffset).toEqual({ x: 0, y: -54 });
    expect(entities[0].label!.horizontalOrigin).toBe('center');
    expect(entities[2].label!.horizontalOrigin).toBe('center');
    expect(entities[2].label!.text).toContain('\n');
    expect(entities[2].label!.text.replaceAll('\n', ' ')).toBe(
      'Fujii-dera Okunoin — Dainichi Nyorai Statue',
    );
  });

  it('keeps temple labels visible at overview distance and reveals other labels on hover or close zoom', () => {
    const collection = validatePoiGeoJson(approved);
    const entities = collection.features.map((feature) => ({
      properties: { getValue: () => feature.properties },
      label: { show: { getValue: () => true } },
    }));
    const source = { entities: { values: entities } };

    setPoiLabelVisibility(source as never, 15000, undefined, 'now' as never);
    expect(entities.map((entity) => entity.label.show.getValue())).toEqual([
      true, false, false, false, false, false, false, false, false, false, true, false,
    ]);
    setPoiLabelVisibility(source as never, 15000, entities[9] as never, 'now' as never);
    expect(entities[9].label.show.getValue()).toBe(true);
    setPoiLabelVisibility(source as never, 3000, undefined, 'now' as never);
    expect(entities.every((entity) => entity.label.show.getValue())).toBe(true);
  });

  it('uses unclamped billboards in 2D and restores terrain clamping in 3D', () => {
    const entity = { billboard: { heightReference: { getValue: () => 'clamp-to-ground' } }, label: { heightReference: { getValue: () => 'clamp-to-ground' } } };
    const source = { entities: { values: [entity] } };

    setPoiSceneMode(source as never, 2 as never);
    expect(entity.billboard.heightReference.getValue()).toBe('none');
    expect(entity.label.heightReference.getValue()).toBe('none');
    setPoiSceneMode(source as never, 3 as never);
    expect(entity.billboard.heightReference.getValue()).toBe('clamp-to-ground');
    expect(entity.label.heightReference.getValue()).toBe('clamp-to-ground');
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
