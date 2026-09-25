import { useEffect, useRef, useState } from 'react';
import type { Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { createViewer } from '../cesium/createViewer';

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

    void createViewer(container)
      .then((createdViewer) => {
        if (disposed) {
          createdViewer.destroy();
          return;
        }

        viewer = createdViewer;
      })
      .catch((cause: unknown) => {
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
