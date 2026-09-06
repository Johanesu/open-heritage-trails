# Shikoku Henro T11 → T12 Demo Dataset

This directory contains the development dataset for the first Open Heritage Trails reference implementation.

## Files

- `trail.geojson` — browser-oriented route geometry for Temple 11 Fujiidera → Temple 12 Shōsanji. The supplied Henro Hub archive also contains a denser 564-vertex full route; the committed file is the 87-vertex web export for initial development.
- `metadata.json` — normalized trail metadata used by the prototype UI.
- `route-summary.json` — compact summary extracted from the Henro Hub route export.
- `elevation-profile.reference.json` — compact reference to the supplied elevation profile. The full profile is intentionally not committed yet because the original HGT DEM provider is not recorded in the archive.
- `SOURCE.md` — provenance and attribution notes.

## Upgrade before grant-ready release

Once exact route and DEM provenance is confirmed, replace `trail.geojson` with the supplied 564-vertex `route.full.geojson` and, if useful for the UI, add the full elevation profile with correct attribution. Cesium World Terrain itself is sufficient for terrain-following route display, so the elevation profile is not a blocker for the first 3D implementation.
