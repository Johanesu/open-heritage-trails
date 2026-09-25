import {
  Cartesian2,
  Color,
  GeoJsonDataSource,
  HeightReference,
  JulianDate,
  LabelGraphics,
  LabelStyle,
  VerticalOrigin,
  type Viewer,
} from 'cesium';

const endpointGeoJsonUrl =
  '/demo/shikoku-henro/t11-t12/endpoints.geojson';

export async function loadTrail(
  viewer: Viewer,
  url: string,
): Promise<GeoJsonDataSource> {
  const routeColor = Color.fromBytes(207, 79, 44);
  const trailSource = await GeoJsonDataSource.load(url, {
    clampToGround: true,
    stroke: routeColor,
    strokeWidth: 6,
  });

  await viewer.dataSources.add(trailSource);

  const endpointSource = await GeoJsonDataSource.load(endpointGeoJsonUrl, {
    clampToGround: true,
    markerColor: routeColor,
    markerSize: 32,
    markerSymbol: '',
  });
  const time = JulianDate.now();

  for (const entity of endpointSource.entities.values) {
    const labelText: unknown = entity.properties?.label?.getValue(time);

    if (typeof labelText === 'string') {
      entity.label = new LabelGraphics({
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        fillColor: Color.WHITE,
        font: '600 16px sans-serif',
        heightReference: HeightReference.CLAMP_TO_GROUND,
        outlineColor: Color.BLACK,
        outlineWidth: 3,
        pixelOffset: new Cartesian2(0, -24),
        style: LabelStyle.FILL_AND_OUTLINE,
        text: labelText,
        verticalOrigin: VerticalOrigin.BOTTOM,
      });
    }
  }

  await viewer.dataSources.add(endpointSource);

  return trailSource;
}
