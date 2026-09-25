import { poiIcons } from '../data/poiIcons';

function PoiLegend() {
  return (
    <details className="map-card map-extra poi-legend">
      <summary>POI legend</summary>
      <ul>
        {Object.entries(poiIcons).map(([key, icon]) => (
          <li key={key}>
            <img alt={icon.label} height="24" src={icon.url} width="24" />
            <span>{icon.label}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default PoiLegend;
