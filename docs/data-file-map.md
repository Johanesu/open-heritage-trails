# Supplied archive → repository map

| Supplied file | Repository use | Decision |
|---|---|---|
| `route.full.geojson` | Source for current prototype route and possible final high-fidelity replacement | A 150-vertex simplification derived from this full geometry is committed as `trail.geojson`; retain the 564-vertex original for possible grant-ready replacement |
| `route.web.geojson` | Comparison/reference only | Reviewed; not used after the 150-vertex prototype route was created |
| `route.preview.geojson` | None | Too coarse for terrain demo |
| `elevation_profile.json` | Elevation reference / future UX | Full file not committed until DEM provenance is confirmed; compact reference committed |
| `route_summary.json` | `route-summary.json` + normalized `metadata.json` | Committed in compact form |
| `surface_summary.json` | Future route styling/research | Useful later; not needed for V0.1 |
| `anchor_split.json` | Internal provenance | Not needed at runtime |
| `route_links.json` | Henro Hub navigation context | Not needed in standalone prototype |
| `export_status.json` | Pipeline provenance | Not needed at runtime |
