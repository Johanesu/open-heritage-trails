import {
  BillboardGraphics,
  Cartesian2,
  Color,
  ConstantProperty,
  GeoJsonDataSource,
  HeightReference,
  HorizontalOrigin,
  JulianDate,
  LabelGraphics,
  LabelStyle,
  PinBuilder,
  SceneMode,
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

const PIN_SIZE = 128;
const PIN_SCALE = 44 / PIN_SIZE;
const CLOSE_LABEL_HEIGHT = 7_000;

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

export function setPoiLabelVisibility(
  source: GeoJsonDataSource,
  cameraHeight: number,
  hovered: Entity | undefined,
  time: JulianDate,
): void {
  for (const entity of source.entities.values) {
    const id = getPoiRecord(entity, time)?.id;
    if (entity.label && id) {
      entity.label.show = new ConstantProperty(id === 'sdb-101' || id === 'sdb-77'
        || cameraHeight <= CLOSE_LABEL_HEIGHT || entity === hovered);
    }
  }
}

export function setPoiSceneMode(source: GeoJsonDataSource, mode: SceneMode): void {
  const heightReference = mode === SceneMode.SCENE2D
    ? HeightReference.NONE : HeightReference.CLAMP_TO_GROUND;
  for (const entity of source.entities.values) {
    if (entity.billboard) entity.billboard.heightReference = new ConstantProperty(heightReference);
    if (entity.label) entity.label.heightReference = new ConstantProperty(heightReference);
  }
}

export async function loadPois(
  viewer: Viewer,
  url: string,
  initiallyHidden = false,
): Promise<GeoJsonDataSource> {
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
        PIN_SIZE,
      );
      pins.set(pinKey, pin);
    }

    entity.billboard = new BillboardGraphics({
      image: pin,
      scale: PIN_SCALE,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
    entity.label = new LabelGraphics({
      text: record.id === 'sdb-101' ? 'T11 Fujii-dera'
        : record.id === 'sdb-77' ? 'T12 Shōsan-ji' : wrapLabel(record.name),
      font: '600 14px sans-serif',
      fillColor: Color.WHITE,
      outlineColor: Color.BLACK,
      outlineWidth: 3,
      style: LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cartesian2(0, -54),
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  }

  if (initiallyHidden) source.show = false;
  await viewer.dataSources.add(source);
  return source;
}
