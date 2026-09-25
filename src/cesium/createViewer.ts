import { Ion, SceneMode, Terrain, Viewer } from 'cesium';

export async function createViewer(container: HTMLElement): Promise<Viewer> {
  const accessToken = import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Missing VITE_CESIUM_ION_ACCESS_TOKEN');
  }

  Ion.defaultAccessToken = accessToken;

  const viewer = new Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    sceneMode: SceneMode.SCENE3D,
    sceneModePicker: false,
    terrain: Terrain.fromWorldTerrain(),
    timeline: false,
  });

  viewer.scene.globe.depthTestAgainstTerrain = true;

  return viewer;
}
