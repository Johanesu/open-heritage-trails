import {
  Cartesian3,
  HeadingPitchRange,
  Math as CesiumMath,
  type GeoJsonDataSource,
  type Viewer,
} from 'cesium';

export async function fitTrail(
  viewer: Viewer,
  source: GeoJsonDataSource,
): Promise<void> {
  await viewer.flyTo(source, {
    duration: 1.5,
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(20),
      CesiumMath.toRadians(-35),
      0,
    ),
  });
}

export function flyToEndpoint(
  viewer: Viewer,
  longitude: number,
  latitude: number,
  heightM: number,
): Promise<void> {
  return new Promise((resolve) => {
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(longitude, latitude, heightM),
      duration: 1.5,
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-45),
        roll: 0,
      },
      complete: resolve,
      cancel: resolve,
    });
  });
}
