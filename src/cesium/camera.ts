import {
  BoundingSphere,
  Cartesian3,
  Cartographic,
  HeadingPitchRange,
  Math as CesiumMath,
  Rectangle,
  SceneMode,
  sampleTerrainMostDetailed,
  type GeoJsonDataSource,
  type Scene,
  type Viewer,
} from 'cesium';

function routePositions(viewer: Viewer, source: GeoJsonDataSource): Cartesian3[] {
  return source.entities.values[0]?.polyline?.positions?.getValue(viewer.clock.currentTime) ?? [];
}

export async function fitTrail(
  viewer: Viewer,
  source: GeoJsonDataSource,
  duration = 1.5,
): Promise<void> {
  const positions = routePositions(viewer, source);
  if (!positions.length) return;
  if (viewer.scene.mode === SceneMode.SCENE2D) {
    const bounds = Rectangle.fromCartesianArray(positions);
    const longitudePadding = (bounds.east - bounds.west) * 0.2;
    const latitudePadding = (bounds.north - bounds.south) * 0.2;
    bounds.west -= longitudePadding;
    bounds.east += longitudePadding;
    bounds.south -= latitudePadding;
    bounds.north += latitudePadding;
    await new Promise<void>((resolve) => viewer.camera.flyTo({
      destination: bounds, duration, complete: resolve, cancel: resolve,
    }));
    return;
  }
  const sphere = BoundingSphere.fromPoints(positions);
  const aspect = viewer.canvas.clientWidth / Math.max(viewer.canvas.clientHeight, 1);
  const range = sphere.radius * (aspect < 0.8 ? 3.4 : 3.1);
  await viewer.flyTo(source, {
    duration,
    offset: new HeadingPitchRange(
      bearing(positions[0], positions[Math.floor(positions.length / 2)]),
      CesiumMath.toRadians(-35),
      range,
    ),
  });
}

export async function focusEndpoint2D(
  viewer: Viewer,
  positions: Cartesian3[],
  last: boolean,
): Promise<void> {
  if (positions.length < 2) return;
  const segment = last ? positions.slice(-21) : positions.slice(0, 21);
  const sphere = BoundingSphere.fromPoints(segment);
  await new Promise<void>((resolve) => {
    viewer.camera.flyToBoundingSphere(sphere, {
      duration: 1.5,
      offset: new HeadingPitchRange(0, -Math.PI / 2, Math.max(1_800, sphere.radius * 3)),
      complete: resolve,
      cancel: resolve,
    });
  });
}

function bearing(from: Cartesian3, to: Cartesian3): number {
  const start = Cartographic.fromCartesian(from);
  const end = Cartographic.fromCartesian(to);
  const deltaLongitude = end.longitude - start.longitude;
  const east = Math.sin(deltaLongitude) * Math.cos(end.latitude);
  const north = Math.cos(start.latitude) * Math.sin(end.latitude)
    - Math.sin(start.latitude) * Math.cos(end.latitude) * Math.cos(deltaLongitude);
  return (Math.atan2(east, north) + 2 * Math.PI) % (2 * Math.PI);
}

export async function flyToEndpoint(
  viewer: Viewer,
  positions: Cartesian3[],
  last: boolean,
): Promise<void> {
  if (positions.length < 2) return;
  const segment = last ? positions.slice(-21) : positions.slice(0, 21);
  const endpoint = last ? segment[segment.length - 1] : segment[0];
  const ahead = last ? segment[0] : segment[segment.length - 1];
  const cartographics = segment.map((position) => Cartographic.fromCartesian(position));
  const sampled = await sampleTerrainMostDetailed(viewer.terrainProvider, cartographics)
    .catch(() => cartographics);
  const elevated = sampled.map((position) => Cartesian3.fromRadians(
    position.longitude,
    position.latitude,
    position.height ?? 0,
  ));
  const sphere = BoundingSphere.fromPoints(elevated);

  return new Promise((resolve) => {
    viewer.camera.flyToBoundingSphere(sphere, {
      duration: 1.5,
      offset: new HeadingPitchRange(
        bearing(endpoint, ahead),
        CesiumMath.toRadians(-35),
        Math.max(2_200, sphere.radius * 2.8),
      ),
      complete: resolve,
      cancel: resolve,
    });
  });
}

export function showIntroGlobe(viewer: Viewer): void {
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(135, 25, 18_000_000),
    orientation: { heading: 0, pitch: CesiumMath.toRadians(-90), roll: 0 },
  });
}

export function waitForGlobeReady(scene: Scene, maxWaitMs = 2_500): Promise<boolean> {
  return new Promise((resolve) => {
    let stableFrames = 0;
    let finished = false;
    let removeListener: () => void = () => undefined;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true;
      removeListener();
      clearTimeout(timer);
      resolve(ready);
    };
    removeListener = scene.postRender.addEventListener(() => {
      stableFrames = scene.globe?.tilesLoaded ? stableFrames + 1 : 0;
      if (stableFrames >= 2) finish(true);
    });
    timer = setTimeout(() => finish(false), maxWaitMs);
  });
}

export async function playTrailIntro(
  viewer: Viewer,
  source: GeoJsonDataSource,
  reducedMotion: boolean,
  reveal: () => void = () => undefined,
): Promise<void> {
  if (reducedMotion) {
    await fitTrail(viewer, source, 0);
    await waitForGlobeReady(viewer.scene);
    reveal();
    return;
  }

  showIntroGlobe(viewer);
  await waitForGlobeReady(viewer.scene);
  await new Promise<void>((resolve) => {
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(134, 34, 1_500_000),
      orientation: { heading: 0, pitch: CesiumMath.toRadians(-90), roll: 0 },
      duration: 2.1,
      complete: resolve,
      cancel: resolve,
    });
  });
  await waitForGlobeReady(viewer.scene);
  reveal();
  await fitTrail(viewer, source, 2.5);
}
