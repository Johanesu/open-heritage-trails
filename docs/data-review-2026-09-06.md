# Review of supplied T11 → T12 route/elevation archive

Source archive reviewed: `shikoku88-temple-11-to-temple-12.zip`

## Contents reviewed

The archive contained nine project files plus macOS metadata:

- `route.full.geojson`
- `route.web.geojson`
- `route.preview.geojson`
- `elevation_profile.json`
- `route_summary.json`
- `surface_summary.json`
- `anchor_split.json`
- `route_links.json`
- `export_status.json`

## Findings

- Full route geometry: one LineString, **564 vertices**, reported length **11.614 km**.
- Web route geometry: **87 vertices**, 15 m simplification tolerance, reported length **11.302 km**.
- Preview route geometry: **23 vertices**, 80 m simplification tolerance, too coarse for the final terrain demo.
- Elevation profile: complete coverage, generated from local HGT DEM tiles; **103 web samples** derived from **564 source samples** at approximately 100 m spacing.
- Elevation range: **31–759 m**.
- Computed ascent/descent: **+1,548 m / -894 m**.
- Surface matching: complete OSM-nearest-way match, but most surface values remain unknown; this is useful later but unnecessary for V0.1.
- No alternative route is present in this Temple 11 → Temple 12 segment.

## Files selected for initial GitHub development dataset

- `trail.geojson`: a **150-vertex** simplification derived from the supplied 564-vertex full route. This retains substantially more trail detail than the 87-vertex web export while staying compact for the prototype.
- `metadata.json`: normalized project metadata.
- `route-summary.json`: compact reference statistics.
- `elevation-profile.reference.json`: compact elevation summary only.
- `endpoints.geojson`: route endpoints associated with T11/T12; these are route endpoint coordinates, not asserted as surveyed temple-building coordinates.
- `pois.geojson`: intentionally empty until the project owner selects the exact cultural/practical POIs.

## Before grant-ready release

1. Confirm the exact original route download source. Waymarked Trails / OpenStreetMap relation 13653655 is the strong current match.
2. Optionally replace the 150-vertex prototype route with the supplied 564-vertex full route for maximum fidelity.
3. Confirm the original HGT DEM provider before publishing the full elevation sample file.
4. Add 8–12 user-approved cultural/practical POIs.
