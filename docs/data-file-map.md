# Supplied archive → repository map

| Supplied file | Repository use | Decision |
|---|---|---|
| `route.full.geojson` | Final high-fidelity demo trail | Keep for later replacement before grant-ready release |
| `route.web.geojson` | `public/demo/shikoku-henro/t11-t12/trail.geojson` | Committed for initial development |
| `route.preview.geojson` | None | Too coarse for terrain demo |
| `elevation_profile.json` | Elevation reference / future UX | Full file not committed until DEM provenance is confirmed |
| `route_summary.json` | `route-summary.json` + normalized `metadata.json` | Committed in compact form |
| `surface_summary.json` | Future route styling/research | Useful later; not needed for V0.1 |
| `anchor_split.json` | Internal provenance | Not needed at runtime |
| `route_links.json` | Henro Hub navigation context | Not needed in standalone prototype |
| `export_status.json` | Pipeline provenance | Not needed at runtime |
