import type { PoiRecord } from '../cesium/loadPois';

interface PoiCardProps {
  poi: PoiRecord;
  onClose: () => void;
}

function PoiCard({ poi, onClose }: PoiCardProps) {
  return (
    <aside
      aria-label="POI details"
      style={{
        background: 'rgba(250, 251, 247, 0.97)',
        borderRadius: '0.75rem',
        bottom: '1rem',
        boxShadow: '0 3px 16px rgba(0, 0, 0, 0.25)',
        color: '#1c2b2a',
        maxHeight: 'calc(100vh - 2rem)',
        maxWidth: 'calc(100vw - 2rem)',
        overflowY: 'auto',
        padding: '1rem',
        position: 'absolute',
        right: '1rem',
        width: '21rem',
        zIndex: 2,
      }}
    >
      <button
        aria-label="Close POI details"
        onClick={onClose}
        style={{ float: 'right' }}
        type="button"
      >
        Close
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
