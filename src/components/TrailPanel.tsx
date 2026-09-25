import type { TrailMetadata } from '../types/trail';

interface TrailPanelProps {
  metadata: TrailMetadata;
}

const metres = (value: number) => `${value.toLocaleString('en-US')} m`;

function TrailPanel({ metadata }: TrailPanelProps) {
  return (
    <aside
      aria-label="Trail information"
      style={{
        background: 'rgba(250, 251, 247, 0.94)',
        borderRadius: '0.75rem',
        boxShadow: '0 3px 16px rgba(0, 0, 0, 0.2)',
        color: '#1c2b2a',
        left: '1rem',
        maxHeight: 'calc(100vh - 2rem)',
        maxWidth: 'calc(100vw - 2rem)',
        overflowY: 'auto',
        padding: '1rem',
        position: 'fixed',
        top: '1rem',
        width: '21rem',
        zIndex: 1,
      }}
    >
      <p style={{ color: '#9b4f31', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: 0 }}>
        Open Heritage Trails
      </p>
      <h1 style={{ fontSize: '1.15rem', lineHeight: 1.3, margin: '0.5rem 0' }}>
        {metadata.title}
      </h1>
      <p style={{ margin: '0 0 0.75rem' }}>{metadata.subtitle}</p>
      <p style={{ margin: '0 0 0.75rem' }}>
        <span>T{metadata.from.templeNumber} {metadata.from.name}</span>
        {' → '}
        <span>T{metadata.to.templeNumber} {metadata.to.name}</span>
      </p>
      <dl style={{ display: 'grid', gap: '0.4rem 1rem', gridTemplateColumns: '1fr auto', margin: 0 }}>
        <dt>Distance</dt><dd style={{ margin: 0 }}>{(metadata.distanceM / 1000).toFixed(1)} km</dd>
        <dt>Ascent</dt><dd style={{ margin: 0 }}>{metres(metadata.ascentM)}</dd>
        <dt>Descent</dt><dd style={{ margin: 0 }}>{metres(metadata.descentM)}</dd>
        <dt>Minimum elevation</dt><dd style={{ margin: 0 }}>{metres(metadata.minElevationM)}</dd>
        <dt>Maximum elevation</dt><dd style={{ margin: 0 }}>{metres(metadata.maxElevationM)}</dd>
      </dl>
      <p style={{ borderTop: '1px solid #c9d1ca', fontSize: '0.75rem', lineHeight: 1.4, margin: '0.75rem 0 0', paddingTop: '0.6rem' }}>
        {metadata.sourceAttribution}
      </p>
    </aside>
  );
}

export default TrailPanel;
