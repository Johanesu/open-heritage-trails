# Open Heritage Trails

Open-source 3D toolkit for cultural, pilgrimage and long-distance trails, built with CesiumJS.

The first reference implementation uses the Shikoku Henro section from Temple 11 Fujiidera to Temple 12 Shōsanji in Tokushima, Japan.

## Status

Early prototype / Cesium Ecosystem Grant reference implementation.

The repository currently contains the approved architecture, implementation plan, licensing/provenance notes, and the initial T11 → T12 reference dataset. Application code is intentionally not scaffolded yet; implementation begins with Task 1 of the plan.

## Why this project exists

Long-distance cultural trails are usually presented as flat route lines or destination-specific applications. Open Heritage Trails explores a reusable way to combine trail geometry, terrain, cultural and practical places, and structured metadata in a purpose-built 3D geospatial experience that can later be adapted to routes worldwide.

Henro Hub is the first real-world reference platform and future integration target, but Open Heritage Trails remains a standalone open-source project.

## First reference implementation

**Shikoku Henro: Temple 11 Fujiidera → Temple 12 Shōsanji**

The initial dataset lives at:

`public/demo/shikoku-henro/t11-t12/`

It includes trail geometry, normalized metadata, route endpoints, attribution notes, an elevation summary, and an intentionally empty POI collection awaiting user-approved cultural/practical records.

## Architecture

The first prototype uses:

- Vite
- React
- TypeScript
- CesiumJS
- Cesium World Terrain through Cesium ion
- static trail/POI data for the reference implementation

Current stable package versions are to be selected when implementation begins rather than copied from Henro Hub's older dependency environment.

## Project documents

- Design: `docs/superpowers/specs/2026-09-06-open-heritage-trails-prototype-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-06-open-heritage-trails-prototype.md`
- Pre-Codex status: `docs/implementation-status.md`
- Dataset review: `docs/data-review-2026-09-06.md`
- Codex start instructions: `docs/codex-start.md`
- Contribution guide: `CONTRIBUTING.md`

## Development environment

The application will read the Cesium ion token from:

`VITE_CESIUM_ION_ACCESS_TOKEN`

Copy `.env.example` to `.env.local` once the local scaffold exists. Never commit the real token.

## License

Software: Apache License 2.0.

Geographic and elevation data: see `DATA_LICENSE.md` and the source notes in each demo dataset directory.
