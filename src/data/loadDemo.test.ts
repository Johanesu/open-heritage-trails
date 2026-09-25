/// <reference types="node" />

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTrailGeoJsonUrl, loadTrailMetadata } from './loadDemo';

const metadataFile = join(
  process.cwd(),
  'public/demo/shikoku-henro/t11-t12/metadata.json',
);
const trailFile = join(
  process.cwd(),
  'public/demo/shikoku-henro/t11-t12/trail.geojson',
);

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, 'utf8')) as unknown;
}

describe('T11 to T12 demo data', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the committed metadata through the public demo URL', async () => {
    const metadata = await readJson(metadataFile);
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => metadata,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadTrailMetadata()).resolves.toEqual(metadata);
    expect(fetchMock).toHaveBeenCalledWith(
      '/demo/shikoku-henro/t11-t12/metadata.json',
    );
    expect(getTrailGeoJsonUrl()).toBe(
      '/demo/shikoku-henro/t11-t12/trail.geojson',
    );
  });

  it('rejects invalid required metadata fields', async () => {
    const metadata = (await readJson(metadataFile)) as Record<string, unknown>;
    const invalidMetadata = [
      { ...metadata, title: undefined },
      { ...metadata, distanceM: '11614.2' },
      { ...metadata, from: { id: '', name: 'Fujiidera' } },
    ];
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    for (const invalidValue of invalidMetadata) {
      fetchMock.mockResolvedValueOnce({ json: async () => invalidValue });
      await expect(loadTrailMetadata()).rejects.toThrow(
        'Invalid trail metadata',
      );
    }
  });

  it('matches the committed trail GeoJSON contract', async () => {
    const collection = (await readJson(trailFile)) as {
      type: string;
      features: Array<{
        geometry: { type: string; coordinates: unknown[] };
      }>;
    };

    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].geometry.type).toBe('LineString');
    expect(collection.features[0].geometry.coordinates.length).toBeGreaterThan(
      100,
    );
  });
});
