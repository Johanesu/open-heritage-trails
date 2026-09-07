# Contributing to Open Heritage Trails

Open Heritage Trails is in an early prototype phase. Contributions are welcome, but the initial Cesium Ecosystem Grant reference implementation is intentionally narrow so that the architecture can be proven before the project expands.

## Current scope

The first reference implementation covers the Shikoku Henro section from Temple 11 Fujiidera to Temple 12 Shōsanji. Development should follow the approved design and implementation plan:

- `docs/superpowers/specs/2026-09-06-open-heritage-trails-prototype-design.md`
- `docs/superpowers/plans/2026-09-06-open-heritage-trails-prototype.md`

Do not expand V0.1 into full-network tiling, offline Cesium, synchronized elevation charts, route planning, user accounts, or an editor/admin system unless the project scope is explicitly revised.

## Development principles

- Use current stable package versions at implementation time.
- Keep the project standalone from Henro Hub production infrastructure.
- Keep source code modular and trail data external to React components.
- Never commit Cesium ion access tokens or other credentials.
- Do not invent or silently alter cultural, historical, route, or POI information.
- Preserve source attribution and keep software licensing separate from geographic-data licensing.
- Prefer small, reviewable commits with tests for new behavior.

## Local setup

After the application scaffold exists:

1. Copy `.env.example` to `.env.local`.
2. Add a Cesium ion token to `VITE_CESIUM_ION_ACCESS_TOKEN`.
3. Install dependencies with the package manager chosen by the initial scaffold.
4. Run the test suite before opening a pull request.
5. Run the production build before opening a pull request.

## Geographic data

See `DATA_LICENSE.md` and the `SOURCE.md` file inside each demo dataset directory before adding or modifying route, elevation, or POI data.

## Pull requests

A pull request should explain:

- what changed;
- why it is within the current project scope;
- what tests were run;
- whether any data source, license, attribution, or Cesium ion requirement changed.

For the initial prototype, the task sequence in the implementation plan is the source of truth.
