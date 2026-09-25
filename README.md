# Open Heritage Trails

Open Heritage Trails is an open-source 3D toolkit for cultural, pilgrimage, and long-distance trails. Its browser prototype uses CesiumJS to place route geometry, terrain, trail statistics, and cultural and practical places in one interactive map.

The current reference implementation follows the Shikoku Henro from Temple 11 Fujiidera to Temple 12 Shōsanji in Tokushima, Japan. It is a standalone demonstration, not a production Henro Hub integration.

## Current prototype

- CesiumJS globe with Cesium World Terrain and imagery; the T11 → T12 route is clamped to terrain and its endpoints are labeled.
- A collapsible route panel with distance, ascent, descent, elevation range, and source attribution.
- 3D / 2D, fit-route, and T11 / T12 navigation controls.
- Twelve project-owner-approved cultural and practical POIs loaded from static GeoJSON, with selectable detail cards, category-colored pins, and an icon legend.
- A responsive browser layout for basic desktop and mobile use, with Cesium navigation help and credits retained.

The committed reference data lives in [`public/demo/shikoku-henro/t11-t12/`](public/demo/shikoku-henro/t11-t12/). The POIs, route, and metadata are external files rather than hard-coded React content.

## Status and public-release gates

This is a working local prototype and a Cesium Ecosystem Grant reference implementation. It has **not** been publicly deployed by this repository task.

Before a tagged public release or live deployment, the project owner must confirm the exact original route download/source and the final production Cesium ion token configuration. The POI glyphs now use MIT-licensed Tabler Icons; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The current route attribution remains provisional; see [`DATA_LICENSE.md`](DATA_LICENSE.md) and the [T11 → T12 source notes](public/demo/shikoku-henro/t11-t12/SOURCE.md). Do not treat the software license as a license for the geographic data or third-party assets.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and put your **local-development** Cesium ion token in `.env.local` as `VITE_CESIUM_ION_ACCESS_TOKEN`:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` must never be committed. The `VITE_` prefix makes this value available to browser code, so use an appropriately scoped, URL-restricted token rather than treating it as a server-side secret.

3. Start the development server:

   ```bash
   npm run dev
   ```

Without a token, the map shows a visible configuration error instead of initializing Cesium. For eventual public hosting, use a **separate** production token; see [`VERCEL.md`](VERCEL.md).

## Architecture and project documents

The app uses Vite, React, TypeScript, CesiumJS, static demo data, and `vite-plugin-static-copy`. Vite serves Cesium Workers, Assets, Widgets, and ThirdParty from `/cesium` in development and copies them to `dist/cesium` for production output.

- [Design](docs/superpowers/specs/2026-09-06-open-heritage-trails-prototype-design.md)
- [Implementation plan](docs/superpowers/plans/2026-09-06-open-heritage-trails-prototype.md)
- [Contribution guide](CONTRIBUTING.md)
- [Data and asset licensing](DATA_LICENSE.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [Deployment preparation](VERCEL.md)

## License

Open Heritage Trails software is licensed under [Apache License 2.0](LICENSE). Geographic/elevation data and third-party interface assets have separate provenance and licensing considerations described in [`DATA_LICENSE.md`](DATA_LICENSE.md), [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md), and the dataset's `SOURCE.md`.
