import type { TrailMetadata } from '../types/trail';

const metadataUrl = '/demo/shikoku-henro/t11-t12/metadata.json';
const trailGeoJsonUrl = '/demo/shikoku-henro/t11-t12/trail.geojson';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRequiredString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isRequiredNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isEndpoint(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRequiredString(value.id) &&
    isRequiredString(value.name) &&
    (value.templeNumber === undefined || isRequiredNumber(value.templeNumber))
  );
}

function isTrailMetadata(value: unknown): value is TrailMetadata {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRequiredString(value.id) &&
    isRequiredString(value.title) &&
    isRequiredString(value.subtitle) &&
    isEndpoint(value.from) &&
    isEndpoint(value.to) &&
    isRequiredNumber(value.distanceM) &&
    isRequiredNumber(value.ascentM) &&
    isRequiredNumber(value.descentM) &&
    isRequiredNumber(value.minElevationM) &&
    isRequiredNumber(value.maxElevationM) &&
    isRequiredString(value.sourceAttribution) &&
    isRequiredString(value.dataLicense)
  );
}

export async function loadTrailMetadata(): Promise<TrailMetadata> {
  const response = await fetch(metadataUrl);
  const metadata: unknown = await response.json();

  if (!isTrailMetadata(metadata)) {
    throw new Error('Invalid trail metadata');
  }

  return metadata;
}

export function getTrailGeoJsonUrl(): string {
  return trailGeoJsonUrl;
}
