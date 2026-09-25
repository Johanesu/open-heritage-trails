import { useState } from 'react';
import type { TrailMetadata } from '../types/trail';

interface TrailPanelProps {
  metadata: TrailMetadata;
}

const metres = (value: number) => `${value.toLocaleString('en-US')} m`;

function TrailPanel({ metadata }: TrailPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      aria-label="Trail information"
      className="map-card trail-panel"
    >
      <div className="trail-panel-header">
        <p className="project-name">Open Heritage Trails</p>
        <button
          aria-controls="trail-details"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse trail information' : 'Expand trail information'}
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>
      {expanded ? (
        <div id="trail-details">
          <h1>{metadata.title}</h1>
          <p>{metadata.subtitle}</p>
          <p>
            <span>T{metadata.from.templeNumber} {metadata.from.name}</span>
            {' → '}
            <span>T{metadata.to.templeNumber} {metadata.to.name}</span>
          </p>
          <dl className="trail-stats">
            <dt>Distance</dt><dd>{(metadata.distanceM / 1000).toFixed(1)} km</dd>
            <dt>Ascent</dt><dd>{metres(metadata.ascentM)}</dd>
            <dt>Descent</dt><dd>{metres(metadata.descentM)}</dd>
            <dt>Minimum elevation</dt><dd>{metres(metadata.minElevationM)}</dd>
            <dt>Maximum elevation</dt><dd>{metres(metadata.maxElevationM)}</dd>
          </dl>
          <p className="trail-source">{metadata.sourceAttribution}</p>
        </div>
      ) : (
        <h1 className="trail-compact-title">
          T{metadata.from.templeNumber} {metadata.from.name} → T{metadata.to.templeNumber} {metadata.to.name}
        </h1>
      )}
    </aside>
  );
}

export default TrailPanel;
