import {
  BillboardGraphics,
  Cartesian2,
  Color,
  GeoJsonDataSource,
  HeightReference,
  HorizontalOrigin,
  JulianDate,
  LabelGraphics,
  LabelStyle,
  PinBuilder,
  VerticalOrigin,
  type Entity,
  type Viewer,
} from 'cesium';
import { poiIcons, type PoiIconKey } from '../data/poiIcons';

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
  iconKey: PoiIconKey;
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

const categoryColors: Record<PoiCategory, string> = {
  temple: '#174d91',
  'sacred-site': '#733f9d',
  'pilgrim-rest': '#08786b',
  accommodation: '#9a5812',
  viewpoint: '#b13554',
};

// Screen-space spacing for the close pairs at the two temples and Ryūsui-an.
const labelPlacements: Record<string, { x: number; y: number; origin: HorizontalOrigin }> = {
  'sdb-101': { x: -24, y: -70, origin: HorizontalOrigin.RIGHT },
  'sdb-1009': { x: 24, y: -48, origin: HorizontalOrigin.LEFT },
  'sdb-151': { x: 24, y: -96, origin: HorizontalOrigin.LEFT },
  'sdb-163': { x: -24, y: -65, origin: HorizontalOrigin.RIGHT },
  'sdb-422': { x: 24, y: -60, origin: HorizontalOrigin.LEFT },
  'sdb-162': { x: -24, y: -72, origin: HorizontalOrigin.RIGHT },
  'sdb-405': { x: 24, y: -52, origin: HorizontalOrigin.LEFT },
  'sdb-77': { x: -24, y: -74, origin: HorizontalOrigin.RIGHT },
  'sdb-139': { x: -24, y: -54, origin: HorizontalOrigin.RIGHT },
};

function wrapLabel(name: string): string {
  if (name.length <= 22) return name;
  const split = name.lastIndexOf(' ', 22);
  return split > 0 ? `${name.slice(0, split)}\n${name.slice(split + 1)}` : name;
}

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
    && Object.hasOwn(categoryColors, value.category)
    && typeof value.iconKey === 'string'
    && Object.hasOwn(poiIcons, value.iconKey)
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

  const { id, name, category, iconKey, description, henroHubUrl } = properties;
  return henroHubUrl === undefined
    ? { id, name, category, iconKey, description }
    : { id, name, category, iconKey, description, henroHubUrl };
}

export async function loadPois(viewer: Viewer, url: string): Promise<GeoJsonDataSource> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load POI GeoJSON');

  const collection = validatePoiGeoJson(await response.json() as unknown);
  const source = await GeoJsonDataSource.load(collection, { clampToGround: true });
  const pinBuilder = new PinBuilder();
  const pins = new Map<string, HTMLCanvasElement>();
  const time = JulianDate.now();

  for (const entity of source.entities.values) {
    const record = getPoiRecord(entity, time);
    if (!record) throw new Error('Invalid POI GeoJSON');

    const pinKey = `${record.category}:${record.iconKey}`;
    let pin = pins.get(pinKey);
    if (!pin) {
      pin = await pinBuilder.fromUrl(
        poiIcons[record.iconKey].url,
        Color.fromCssColorString(categoryColors[record.category]),
        44,
      );
      pins.set(pinKey, pin);
    }

    entity.billboard = new BillboardGraphics({
      image: pin,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
    const placement = labelPlacements[record.id];
    entity.label = new LabelGraphics({
      text: record.id === 'sdb-101' ? 'T11 Fujii-dera'
        : record.id === 'sdb-77' ? 'T12 Shōsan-ji' : wrapLabel(record.name),
      font: '600 14px sans-serif',
      fillColor: Color.WHITE,
      outlineColor: Color.BLACK,
      outlineWidth: 3,
      style: LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cartesian2(placement?.x ?? 0, placement?.y ?? -54),
      horizontalOrigin: placement?.origin ?? HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  }

  await viewer.dataSources.add(source);
  return source;
}
