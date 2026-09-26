import { useEffect, useState } from 'react';
import type { PoiRecord } from './cesium/loadPois';
import AboutBadge from './components/AboutBadge';
import CesiumScene from './components/CesiumScene';
import PoiCard from './components/PoiCard';
import PoiLegend from './components/PoiLegend';
import TrailPanel from './components/TrailPanel';
import { loadTrailMetadata } from './data/loadDemo';
import type { TrailMetadata } from './types/trail';

function App() {
  const [metadata, setMetadata] = useState<TrailMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<PoiRecord | null>(null);

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
      <CesiumScene onSelectPoi={setSelectedPoi} />
      <div className="left-ui-stack">
        {metadata ? (
          <TrailPanel metadata={metadata} />
        ) : (
          <aside aria-label="Trail information" className="map-card">
            <strong>Open Heritage Trails</strong>
            <p>Shikoku Henro</p>
            {metadataError ? <p role="alert">{metadataError}</p> : null}
          </aside>
        )}
        {selectedPoi ? <PoiCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} /> : null}
      </div>
      <div className="map-extras">
        <PoiLegend />
        <AboutBadge />
      </div>
    </main>
  );
}

export default App;
