# Data Licensing

Open Heritage Trails source code is licensed separately under the Apache License 2.0. Geographic and elevation datasets are **not** automatically covered by the software license.

## Shikoku Henro T11 → T12 demo

Development metadata for the first reference implementation lives under:

`public/demo/shikoku-henro/t11-t12/`

The current route provenance is documented in that directory's `SOURCE.md`.

The likely source is OpenStreetMap route data distributed through Waymarked Trails. Waymarked Trails states that GPX tracks are made from OpenStreetMap data under the Open Data Commons Open Database License (ODbL) 1.0. The exact original download source used by the Henro Hub export must be confirmed before the first tagged public release and before final grant-demo attribution is presented as definitive.

The supplied elevation profile was generated from local HGT DEM tiles, but the archive does not record the original DEM provider. Until that provenance is confirmed, elevation samples should be treated as development/reference data rather than given a definitive public data license.

## Required attribution discipline

- Keep software licensing separate from data licensing.
- Preserve OpenStreetMap/Waymarked Trails attribution where applicable.
- Do not label third-party geographic data as Apache-2.0.
- Record the exact source URL, retrieval method/date when known, and applicable license before a tagged release.
