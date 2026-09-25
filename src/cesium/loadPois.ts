import {
  BillboardGraphics,
  Color,
  GeoJsonDataSource,
  HeightReference,
  JulianDate,
  PinBuilder,
  VerticalOrigin,
  type Entity,
  type Viewer,
} from 'cesium';

export type PoiCategory =
  | 'temple'
  | 'sacred-site'
  | 'pilgrim-rest'
  | 'accommodation'
  | 'viewpoint';

export interface PoiRecord {
  id: string;
  name: string;
  category: PoiCategory;
  description: string;
  henroHubUrl?: string;
}

interface PoiFeature {
  type: 'Feature';
  properties: PoiRecord;
  geometry: { type: 'Point'; coordinates: [number, number] };
}

interface PoiCollection {
  type: 'FeatureCollection';
  features: PoiFeature[];
}

const categoryStyle: Record<PoiCategory, { color: string; letter: string }> = {
  temple: { color: '#174d91', letter: 'T' },
  'sacred-site': { color: '#733f9d', letter: 'S' },
  'pilgrim-rest': { color: '#08786b', letter: 'R' },
  accommodation: { color: '#9a5812', letter: 'A' },
  viewpoint: { color: '#b13554', letter: 'V' },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPoiRecord(value: unknown): value is PoiRecord {
  if (!isObject(value)) return false;

  return isNonEmptyString(value.id)
    && isNonEmptyString(value.name)
    && typeof value.category === 'string'
    && Object.hasOwn(categoryStyle, value.category)
    && isNonEmptyString(value.description)
    && (value.henroHubUrl === undefined || isNonEmptyString(value.henroHubUrl));
}

export function validatePoiGeoJson(value: unknown): PoiCollection {
  if (!isObject(value) || value.type !== 'FeatureCollection' || !Array.isArray(value.features)) {
    throw new Error('Invalid POI GeoJSON');
  }

  for (const feature of value.features) {
    if (!isObject(feature) || feature.type !== 'Feature' || !isObject(feature.geometry)
      || feature.geometry.type !== 'Point' || !Array.isArray(feature.geometry.coordinates)
      || feature.geometry.coordinates.length !== 2
      || !feature.geometry.coordinates.every((coordinate: unknown) => typeof coordinate === 'number' && Number.isFinite(coordinate))
      || !isPoiRecord(feature.properties)) {
      throw new Error('Invalid POI GeoJSON');
    }
  }

  return value as unknown as PoiCollection;
}

export function getPoiRecord(entity: Entity, time: JulianDate): PoiRecord | undefined {
  const properties: unknown = entity.properties?.getValue(time);
  if (!isPoiRecord(properties)) return undefined;

  const { id, name, category, description, henroHubUrl } = properties;
  return henroHubUrl === undefined
    ? { id, name, category, description }
    : { id, name, category, description, henroHubUrl };
}

export async function loadPois(viewer: Viewer, url: string): Promise<GeoJsonDataSource> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load POI GeoJSON');

  const collection = validatePoiGeoJson(await response.json() as unknown);
  const source = await GeoJsonDataSource.load(collection, { clampToGround: true });
  const pinBuilder = new PinBuilder();
  const pins = new Map<PoiCategory, HTMLCanvasElement>();
  const time = JulianDate.now();

  for (const entity of source.entities.values) {
    const record = getPoiRecord(entity, time);
    if (!record) throw new Error('Invalid POI GeoJSON');

    const style = categoryStyle[record.category];
    let pin = pins.get(record.category);
    if (!pin) {
      pin = pinBuilder.fromText(style.letter, Color.fromCssColorString(style.color), 40);
      pins.set(record.category, pin);
    }

    entity.billboard = new BillboardGraphics({
      image: pin,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  }

  await viewer.dataSources.add(source);
  return source;
}
