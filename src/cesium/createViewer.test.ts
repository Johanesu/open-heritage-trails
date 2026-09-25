import { afterEach, describe, expect, it, vi } from 'vitest';
import { createViewer } from './createViewer';

const cesiumMocks = vi.hoisted(() => {
  const terrain = { kind: 'world-terrain' };
  const viewer = {
    scene: {
      globe: {
        depthTestAgainstTerrain: false,
      },
    },
  };

  return {
    fromWorldTerrain: vi.fn(() => terrain),
    ion: { defaultAccessToken: '' },
    terrain,
    viewer,
    viewerConstructor: vi.fn(function Viewer() {
      return viewer;
    }),
  };
});

vi.mock('cesium', () => ({
  Ion: cesiumMocks.ion,
  SceneMode: { SCENE3D: 3 },
  Terrain: { fromWorldTerrain: cesiumMocks.fromWorldTerrain },
  Viewer: cesiumMocks.viewerConstructor,
}));

describe('createViewer', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    cesiumMocks.ion.defaultAccessToken = '';
    cesiumMocks.viewer.scene.globe.depthTestAgainstTerrain = false;
  });

  it('requires a Cesium ion access token', async () => {
    vi.stubEnv('VITE_CESIUM_ION_ACCESS_TOKEN', '');

    await expect(createViewer(document.createElement('div'))).rejects.toThrow(
      'Missing VITE_CESIUM_ION_ACCESS_TOKEN',
    );
    expect(cesiumMocks.viewerConstructor).not.toHaveBeenCalled();
  });

  it('creates a minimal 3D Viewer with World Terrain', async () => {
    const container = document.createElement('div');
    vi.stubEnv('VITE_CESIUM_ION_ACCESS_TOKEN', 'test-token');

    await expect(createViewer(container)).resolves.toBe(cesiumMocks.viewer);
    expect(cesiumMocks.ion.defaultAccessToken).toBe('test-token');
    expect(cesiumMocks.fromWorldTerrain).toHaveBeenCalledTimes(1);
    expect(cesiumMocks.viewerConstructor).toHaveBeenCalledWith(container, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      sceneMode: 3,
      sceneModePicker: false,
      terrain: cesiumMocks.terrain,
      timeline: false,
    });
    expect(cesiumMocks.viewer.scene.globe.depthTestAgainstTerrain).toBe(true);
  });
});
