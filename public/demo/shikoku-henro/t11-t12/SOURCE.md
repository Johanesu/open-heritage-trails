# T11 → T12 Demo Data Provenance

## Route geometry

The supplied Henro Hub export contains the Temple 11 Fujiidera → Temple 12 Shōsanji section as a single `LineString` with 564 source vertices and a reported length of 11.614 km.

The project owner reports that this main-route geometry originates from an openly downloadable trail source connected to the OpenStreetMap hiking ecosystem. External verification found a strong match with **Waymarked Trails / OpenStreetMap relation 13653655 (Shikoku Pilgrimage)**. Waymarked Trails states that its GPX tracks use OpenStreetMap data under the **ODbL 1.0** and require attribution to OpenStreetMap and Waymarked Trails.

Before the first tagged public release or Cesium grant submission, confirm the exact original download source used for this Henro Hub route export. Until then, repository metadata labels the ODbL attribution as provisional rather than claiming provenance with certainty.

Useful references:

- https://hiking.waymarkedtrails.org/
- https://www.openstreetmap.org/relation/13653655
- https://www.openstreetmap.org/copyright

## Elevation data

The supplied `elevation_profile.json` reports that elevations were computed from local HGT DEM tiles and provides complete coverage for the route. The archive does not identify the original DEM provider. The exact DEM provenance should therefore be confirmed before redistributing the elevation profile as a public project asset.

For the initial Cesium prototype, the route does not require this profile to sit correctly on the landscape because Cesium World Terrain provides the 3D terrain surface. The supplied profile remains useful for route statistics, comparison, and later elevation UX.

## Derived route statistics from the supplied export

- Route length: **11.614 km**
- Ascent: **1,548 m**
- Descent: **894 m**
- Minimum sampled elevation: **31 m**
- Maximum sampled elevation: **759 m**
- Full route vertices: **564**
- Elevation coverage reported by the export: **100%**

These figures are treated as Henro Hub-derived reference data for development; source attribution remains governed by the underlying route and DEM datasets.
