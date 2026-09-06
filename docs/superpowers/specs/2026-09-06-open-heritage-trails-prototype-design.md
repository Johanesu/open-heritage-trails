# Open Heritage Trails Prototype Design

## Status

Approved design for the first Open Heritage Trails prototype and Cesium Ecosystem Grant reference implementation.

## Project identity

**Project name:** Open Heritage Trails

**Purpose:** An open-source toolkit and reference implementation for visualizing cultural, pilgrimage, hiking, and other long-distance trails in 3D geospatial environments.

**First reference implementation:** Shikoku Henro — Temple 11 Fujiidera to Temple 12 Shōsanji.

**Relationship to Henro Hub:** Open Heritage Trails is a standalone open-source project. Henro Hub is the first real-world reference platform and future integration target, but the prototype must not depend on Henro Hub production infrastructure.

## Strategic objective

The prototype must demonstrate that a purpose-built 3D cultural-trail experience can add meaningful spatial understanding beyond a conventional 2D map, while establishing a reusable architecture that can later support trails worldwide.

It must not attempt to prove that Cesium is universally superior to MapLibre. Henro Hub already uses a modern MapLibre/PMTiles geospatial architecture. The prototype should instead test what CesiumJS adds for terrain understanding, 3D cultural interpretation, and interoperable trail visualization.

## Shikoku Henro route framing

Henro Hub V2 contains approximately **2,700 km of mapped Shikoku Henro route geometry**, including the primary walking alignment and extensive alternative and variant alignments. This is not a single 2,700 km pilgrimage itinerary; no individual pilgrim would normally walk all of that geometry.

The T11 Fujiidera → T12 Shōsanji prototype uses a single main walking route with no competing alternative alignment on that section. This makes it suitable for a first demonstrator focused on terrain, route comprehension, and cultural/practical POIs rather than route-choice UX.

The route dataset included in the public repository must have clearly documented redistribution rights and attribution. Code licensing and data licensing must remain separate.

## Scope

### In scope for V0.1

- Standalone public web application.
- Vite + React + TypeScript + CesiumJS.
- Current stable package versions at implementation time; do not copy legacy Henro Hub dependency versions.
- Cesium World Terrain through Cesium ion for the public prototype.
- One route: T11 Fujiidera → T12 Shōsanji.
- Temple 11 and Temple 12 as prominent trail endpoints.
- Approximately 8–12 selected cultural, spiritual, practical, or route-relevant POIs.
- Route geometry loaded from structured external data, not hard-coded JSX.
- POIs loaded from structured external data, not hard-coded JSX.
- Route metadata file containing title, start/end, distance, ascent, descent, source, attribution, and license fields.
- Terrain-clamped route visualization.
- Oblique 3D opening camera that communicates the mountain terrain immediately.
- 3D and 2D scene modes exposed to the user.
- Fit-route/reset-camera action.
- T11 and T12 camera actions.
- POI visibility toggle.
- Clickable POIs with compact information cards.
- Temple cards with links back to Henro Hub where useful.
- Minimal legend and trail information panel.
- Public GitHub repository.
- Public deployment, initially via Vercel.
- Apache-2.0 license for source code.
- Separate data-license and attribution documentation.
- README with setup, architecture, demo-data, and project-purpose documentation.

### Explicitly out of scope for V0.1

- Full 2,700 km Henro Hub route network.
- Henro Hub production integration.
- Supabase integration.
- Authentication or admin tools.
- Native iOS/Android integration.
- Offline Cesium support.
- Full PMTiles-to-Cesium pipeline.
- Cesium vector-tile technology preview integration as a production dependency.
- Full Henro Hub POI database.
- User route planning.
- Route alternatives UX.
- Elevation-chart synchronization.
- Animated fly-through storytelling.
- Photo-heavy storytelling.
- Trail editor/import UI.
- Multi-trail public catalog.

## Architecture

The prototype is a standalone static web app with no backend dependency.

```text
Browser
  |
  +-- React UI
  |
  +-- CesiumJS viewer
  |     |
  |     +-- Cesium ion access token
  |     +-- Cesium World Terrain
  |
  +-- Static trail data
        |
        +-- trail.geojson
        +-- pois.geojson
        +-- metadata.json
```

Henro Hub remains separate:

```text
Henro Hub production
  |
  +-- MapLibre
  +-- PMTiles/vector architecture
  +-- existing route/POI systems

Open Heritage Trails prototype
  |
  +-- standalone CesiumJS reference implementation
  +-- frozen, redistributable T11→T12 sample data
```

A future funded version may add adapters between Henro Hub-style route data and a generic Open Heritage Trails schema, and may investigate interoperability with MapLibre/PMTiles and Cesium vector/3D Tiles workflows.

## Proposed repository structure

```text
open-heritage-trails/
├── README.md
├── LICENSE
├── DATA_LICENSE.md
├── .env.example
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── TrailPanel.tsx
│   │   ├── PoiCard.tsx
│   │   └── ViewControls.tsx
│   ├── cesium/
│   │   ├── createViewer.ts
│   │   ├── loadTrail.ts
│   │   ├── loadPois.ts
│   │   └── camera.ts
│   └── types/
│       └── trail.ts
├── public/
│   └── demo/
│       └── shikoku-henro/
│           └── t11-t12/
│               ├── trail.geojson
│               ├── pois.geojson
│               └── metadata.json
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

Files should stay small and responsibility-focused. The Cesium viewer lifecycle, trail loading, POI loading, and camera behavior should not be concentrated in one large component.

## Data model

### `metadata.json`

Required fields:

- `id`
- `title`
- `subtitle`
- `trailType`
- `startName`
- `endName`
- `distanceKm`
- `ascentM`
- `descentM`
- `sourceName`
- `sourceUrl`
- `licenseName`
- `licenseUrl`
- `attributionText`

### `trail.geojson`

A GeoJSON FeatureCollection containing the T11→T12 line geometry and reusable trail properties.

Minimum trail properties:

- `id`
- `name`
- `role` (`main` for this prototype)
- `trailType`

### `pois.geojson`

A GeoJSON FeatureCollection of Point features.

Minimum POI properties:

- `id`
- `name`
- `category`
- `description`
- `importance`
- optional `henroHubUrl`

The schema should remain generic enough that later examples are not Shikoku-specific.

## User experience

### Opening state

- Full-browser Cesium canvas.
- Oblique 3D camera centered on the T11→T12 mountain corridor.
- Route visible immediately.
- Temple endpoints visually prominent.
- Minimal interface that keeps terrain dominant.

### Controls

- `3D` / `2D` view switch.
- `Fit route`.
- `T11`.
- `T12`.
- POI visibility toggle.

### Trail panel

Shows:

- Open Heritage Trails branding.
- `Shikoku Henro · T11 → T12`.
- Distance.
- Ascent.
- Descent.
- Short explanation that this is the first reference implementation.

### POI interaction

Clicking a POI opens a compact card containing:

- name;
- category;
- concise description;
- optional link to the corresponding Henro Hub page.

## Visual direction

The prototype should look calm, deliberate, and professional rather than like a default Cesium developer demo.

The terrain is the main visual feature. UI chrome should remain restrained. The first five seconds should communicate why the T11→T12 section is demanding and how 3D changes route comprehension.

Do not over-design before the grant application. Functional clarity and a credible open-source implementation are more important than a fully branded product system.

## Cesium ion and token handling

- Development may use a developer token locally.
- The public deployment must use a dedicated application token.
- The public token should have minimum necessary permissions and URL/domain restrictions where available.
- `.env.local` or equivalent secret-bearing local configuration must not be committed.
- `.env.example` should document the required environment variable.

## Licensing

### Source code

Apache License 2.0.

### Trail and POI data

Use the source dataset's actual license and attribution requirements. Do not relicense third-party geographic data as Apache-2.0.

`DATA_LICENSE.md` must explain:

- source;
- source URL;
- license;
- attribution requirements;
- whether POIs are original Henro Hub content or derived from another source.

## Deployment

The prototype should initially deploy independently from Henro Hub, preferably through Vercel.

A Vercel project URL is sufficient for development and grant review. A later custom host such as `3d.henro.app` is optional and must not block the prototype.

No standalone `openheritagetrails.org` website is required for the grant prototype.

## Open-source positioning

Open Heritage Trails should be worldwide in scope from the first commit, even though the first example is Shikoku.

The repository and documentation should present the Shikoku Henro as **reference implementation #1**, not as the definition of the project.

A future project structure may support examples such as other pilgrimage routes, national trails, cultural routes, and hiking networks without requiring core code changes.

## MapLibre interoperability position

Henro Hub's existing MapLibre/PMTiles architecture is an asset, not something this project is intended to replace.

The Cesium prototype should answer:

> What does a purpose-built 3D cultural-trail experience add beyond an existing modern MapLibre trail platform?

The grant-funded roadmap may later explore interoperability between:

- GeoJSON;
- PMTiles / MapLibre vector ecosystems;
- CesiumJS;
- emerging Cesium vector-tile / 3D Tiles workflows.

Do not promise direct PMTiles support in V0.1 unless implementation evidence justifies it.

## Acceptance criteria for grant-link readiness

The prototype is ready to be linked in the Cesium application only when all of the following are true:

1. Public URL loads without authentication.
2. Public repository builds from documented instructions.
3. Cesium World Terrain loads reliably.
4. T11→T12 route visibly follows terrain.
5. Temple 11 and Temple 12 can be selected/focused.
6. Approximately 8–12 POIs load from external structured data.
7. Clicking a POI displays its metadata.
8. Fit-route/reset-camera functionality works.
9. 3D and 2D scene modes work.
10. Current Chrome and Safari desktop are usable.
11. Basic mobile layout does not break.
12. Cesium token handling is appropriate for public deployment.
13. Source-code license, data license, source attribution, and third-party notices are explicit.
14. No Henro Hub production infrastructure is required.

## Testing strategy

The implementation plan should include:

- unit tests for metadata/data parsing where practical;
- tests for reusable data helpers and trail/POI transformations;
- build verification;
- browser smoke tests for Cesium initialization and user-facing controls;
- manual visual verification of route clamping and camera framing on the actual T11→T12 dataset;
- Chrome and Safari desktop checks;
- responsive-layout check on a mobile viewport.

## Grant relationship

The prototype is deliberately smaller than the proposed Cesium Ecosystem Grant project.

The grant-funded work can reasonably expand from one static reference implementation toward:

- a reusable trail schema;
- generic import/adaptation workflows;
- larger route-network rendering;
- route variants and branching trails;
- metadata-driven styling;
- vector-data scalability experiments;
- interoperability with existing 2D trail ecosystems;
- documentation/tutorials for other trail organizations;
- a broader Shikoku Henro reference implementation;
- potential integration into Henro Hub as a 3D Explorer.

The prototype must prove feasibility without pre-building the work for which grant funding is being requested.

## Development workflow

- Strategy, scope, grant narrative, and architecture remain managed in the dedicated Cesium funding chat.
- GitHub is the permanent technical project record.
- Codex is the preferred implementation environment.
- Development should happen in the standalone `open-heritage-trails` repository.
- Henro Hub production code should remain untouched during V0.1.
- Use current stable dependencies at implementation time.
- Prefer small, testable commits.

## Success definition

V0.1 succeeds when a Cesium grant reviewer can open a public link, immediately understand the mountain character of the T11→T12 section, interact with route/heritage information, inspect the open-source implementation, and see a credible path from this demonstrator to a reusable worldwide cultural-trail toolkit.