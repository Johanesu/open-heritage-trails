import { useEffect, useState } from 'react';
import CesiumScene from './components/CesiumScene';
import TrailPanel from './components/TrailPanel';
import { loadTrailMetadata } from './data/loadDemo';
import type { TrailMetadata } from './types/trail';

function App() {
  const [metadata, setMetadata] = useState<TrailMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    void loadTrailMetadata()
      .then((trailMetadata) => {
        if (!disposed) setMetadata(trailMetadata);
      })
      .catch(() => {
        if (!disposed) setMetadataError('Unable to load trail information');
      });

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <main>
      <CesiumScene />
      {metadata ? (
        <TrailPanel metadata={metadata} />
      ) : (
        <aside style={{ background: '#fafbf7', borderRadius: '0.75rem', left: '1rem', padding: '1rem', position: 'fixed', top: '1rem', zIndex: 1 }}>
          <strong>Open Heritage Trails</strong>
          <p>Shikoku Henro</p>
          {metadataError ? <p role="alert">{metadataError}</p> : null}
        </aside>
      )}
    </main>
  );
}

export default App;
