# Open Heritage Trails

Open-source 3D toolkit for cultural, pilgrimage and long-distance trails, built with CesiumJS.

The first reference implementation uses the Shikoku Henro section from Temple 11 Fujiidera to Temple 12 Shōsanji in Tokushima, Japan.

## Status

Early prototype / Cesium Ecosystem Grant reference implementation.

## Architecture

The project is intentionally standalone from Henro Hub production infrastructure. The first prototype uses Vite, React, TypeScript and CesiumJS with Cesium World Terrain. Henro Hub serves as the first real-world reference platform and future integration target.

See:

- `docs/superpowers/specs/2026-09-06-open-heritage-trails-prototype-design.md`
- `docs/superpowers/plans/2026-09-06-open-heritage-trails-prototype.md`

## License

Software: Apache License 2.0.

Geographic and elevation data: see `DATA_LICENSE.md` and the source notes in each demo dataset directory.
