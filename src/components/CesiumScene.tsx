import { useEffect, useRef, useState } from 'react';
import type { Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { fitTrail } from '../cesium/camera';
import { createViewer } from '../cesium/createViewer';
import { loadTrail } from '../cesium/loadTrail';
import { getTrailGeoJsonUrl } from '../data/loadDemo';

function CesiumScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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
      viewer?.destroy();
    };
  }, []);

  return (
    <section
      aria-label="3D trail map"
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
    </section>
  );
}

export default CesiumScene;
