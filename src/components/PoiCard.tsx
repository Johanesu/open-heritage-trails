import type { PoiRecord } from '../cesium/loadPois';

interface PoiCardProps {
  poi: PoiRecord;
  onClose: () => void;
}

function PoiCard({ poi, onClose }: PoiCardProps) {
  return (
    <aside
      aria-label="POI details"
      className="map-card poi-card"
    >
      <button
        aria-label="Close POI details"
        className="poi-card-close"
        onClick={onClose}
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{poi.category}</p>
      <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem' }}>{poi.name}</h2>
      <p style={{ lineHeight: 1.45, margin: 0 }}>{poi.description}</p>
      {poi.henroHubUrl ? (
        <p style={{ margin: '0.75rem 0 0' }}>
          <a href={poi.henroHubUrl} rel="noopener noreferrer" target="_blank">View in Henro Hub</a>
        </p>
      ) : null}
    </aside>
  );
}

export default PoiCard;
