import {
  Color,
  GeoJsonDataSource,
  type Viewer,
} from 'cesium';

export async function loadTrail(
  viewer: Viewer,
  url: string,
  initiallyHidden = false,
): Promise<GeoJsonDataSource> {
  const routeColor = Color.fromBytes(207, 79, 44);
  const trailSource = await GeoJsonDataSource.load(url, {
    clampToGround: true,
    stroke: routeColor,
    strokeWidth: 6,
  });

  if (initiallyHidden) trailSource.show = false;
  await viewer.dataSources.add(trailSource);
  return trailSource;
}
