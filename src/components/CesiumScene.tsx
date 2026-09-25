import { useEffect, useRef, useState } from 'react';
import { Cartographic, Math as CesiumMath, SceneMode, type GeoJsonDataSource, type Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { fitTrail, flyToEndpoint } from '../cesium/camera';
import { createViewer } from '../cesium/createViewer';
import { loadTrail } from '../cesium/loadTrail';
import { getTrailGeoJsonUrl } from '../data/loadDemo';
import ViewControls from './ViewControls';

function CesiumScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ viewer: Viewer; trailSource: GeoJsonDataSource } | null>(null);
  const removeMorphListenerRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  function focusEndpoint(last: boolean) {
    const scene = sceneRef.current;
    if (!scene) return;

    const positions = scene.trailSource.entities.values[0]?.polyline?.positions?.getValue(
      scene.viewer.clock.currentTime,
    );
    const point = positions?.[last ? positions.length - 1 : 0];
    if (!point) return;

    const location = Cartographic.fromCartesian(point);
    void flyToEndpoint(
      scene.viewer,
      CesiumMath.toDegrees(location.longitude),
      CesiumMath.toDegrees(location.latitude),
      1800,
    );
  }

  function switchMode(mode: typeof SceneMode.SCENE2D | typeof SceneMode.SCENE3D) {
    const current = sceneRef.current;
    if (!current) return;

    const { viewer, trailSource } = current;
    const scene = viewer.scene;
    removeMorphListenerRef.current?.();
    removeMorphListenerRef.current = null;

    if (scene.mode === mode) {
      void fitTrail(viewer, trailSource);
      return;
    }

    const removeListener = scene.morphComplete.addEventListener(() => {
      removeListener();
      removeMorphListenerRef.current = null;
      void fitTrail(viewer, trailSource);
    });
    removeMorphListenerRef.current = removeListener;

    if (mode === SceneMode.SCENE2D) scene.morphTo2D();
    else scene.morphTo3D();
  }

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let viewer: Viewer | undefined;
    let disposed = false;

    async function initializeScene(sceneContainer: HTMLElement) {
      const createdViewer = await createViewer(sceneContainer);

      if (disposed) {
        createdViewer.destroy();
        return;
      }

      viewer = createdViewer;
      const trailSource = await loadTrail(
        createdViewer,
        getTrailGeoJsonUrl(),
      );

      if (!disposed) {
        await fitTrail(createdViewer, trailSource);
        sceneRef.current = { viewer: createdViewer, trailSource };
        setReady(true);
      }
    }

    void initializeScene(container).catch((cause: unknown) => {
      if (!disposed) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to initialize the Cesium Viewer',
        );
      }
    });

    return () => {
      disposed = true;
      removeMorphListenerRef.current?.();
      removeMorphListenerRef.current = null;
      sceneRef.current = null;
      viewer?.destroy();
    };
  }, []);

  return (
    <section
      aria-label="Trail map"
      style={{ inset: 0, position: 'fixed', zIndex: 0 }}
    >
      <div
        data-testid="cesium-container"
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
      />
      {error ? (
        <div
          role="alert"
          style={{
            background: '#fff',
            border: '1px solid #b9583c',
            borderRadius: '0.5rem',
            color: '#512519',
            left: '50%',
            maxWidth: '32rem',
            padding: '1rem',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 2rem)',
          }}
        >
          <strong>Unable to start the 3D map</strong>
          <p>{error}</p>
        </div>
      ) : null}
      <ViewControls
        disabled={!ready}
        on3D={() => switchMode(SceneMode.SCENE3D)}
        on2D={() => switchMode(SceneMode.SCENE2D)}
        onFitRoute={() => {
          const scene = sceneRef.current;
          if (scene) void fitTrail(scene.viewer, scene.trailSource);
        }}
        onTemple11={() => focusEndpoint(false)}
        onTemple12={() => focusEndpoint(true)}
      />
    </section>
  );
}

export default CesiumScene;
