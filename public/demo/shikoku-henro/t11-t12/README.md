# Shikoku Henro T11 → T12 Demo Dataset

This directory contains the development dataset for the first Open Heritage Trails reference implementation.

## Files

- `trail.geojson` — browser-oriented route geometry for Temple 11 Fujiidera → Temple 12 Shōsanji. It is a 150-vertex simplification derived from the supplied 564-vertex full route, chosen to preserve substantially more mountain-trail detail than the original 87-vertex web export while keeping the prototype asset compact.
- `metadata.json` — normalized trail metadata used by the prototype UI.
- `route-summary.json` — compact summary extracted from the Henro Hub route export.
- `elevation-profile.reference.json` — compact reference to the supplied elevation profile. The full profile is intentionally not committed yet because the original HGT DEM provider is not recorded in the archive.
- `endpoints.geojson` — route endpoints associated with T11/T12. These are route endpoint coordinates, not asserted as surveyed temple-building coordinates.
- `pois.geojson` — intentionally empty until the project owner selects the exact cultural/practical POIs.
- `SOURCE.md` — provenance and attribution notes.

## Upgrade before grant-ready release

Once exact route and DEM provenance is confirmed, we can optionally replace `trail.geojson` with the supplied 564-vertex `route.full.geojson` for maximum fidelity and add the full elevation profile with correct attribution. Cesium World Terrain itself is sufficient for terrain-following route display, so the full elevation profile is not a blocker for the first 3D implementation.
