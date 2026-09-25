# Data Licensing

Open Heritage Trails source code is licensed separately under the Apache License 2.0. Geographic and elevation datasets are **not** automatically covered by the software license.

## Shikoku Henro T11 → T12 demo

Development metadata for the first reference implementation lives under:

`public/demo/shikoku-henro/t11-t12/`

The current route provenance is documented in that directory's `SOURCE.md`.

The seven POI interface glyphs in `public/icons/tabler/` are selected from **Tabler Icons**, which is distributed under the MIT License. Their upstream icon names and local mappings are documented in `THIRD_PARTY_NOTICES.md`. These third-party SVGs are not relicensed under Apache-2.0.

The T11 → T12 route geometry was sourced via **Waymarked Trails** from OpenStreetMap route data. Waymarked Trails identifies its map/route data as OpenStreetMap data under the **Open Data Commons Open Database License (ODbL) 1.0**. The project owner recalls this source with high confidence, although the exact historical retrieval date and original downloaded file are no longer available.

Route attribution used by the demo:

> Route data © OpenStreetMap contributors, ODbL 1.0; sourced via Waymarked Trails.

The supplied elevation profile was generated from local HGT DEM tiles, but the archive does not record the original DEM provider. Until that provenance is confirmed, elevation samples should be treated as development/reference data rather than given a definitive public data license.

## Required attribution discipline

- Keep software licensing separate from data and third-party asset licensing.
- Preserve OpenStreetMap/Waymarked Trails attribution for the route geometry.
- Preserve the Tabler Icons MIT notice for the copied SVG glyphs.
- Do not label third-party geographic data or third-party icon assets as Apache-2.0.
- Keep elevation-profile provenance separate from route-geometry provenance.
