# Open Heritage Trails Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public CesiumJS prototype that presents the Shikoku Henro Temple 11 Fujiidera → Temple 12 Shōsanji section as an interactive 3D cultural-trail experience, while keeping the implementation reusable for future trails worldwide.

**Architecture:** A standalone Vite + React + TypeScript application loads static trail, endpoint, POI, and metadata files from `public/demo/shikoku-henro/t11-t12/`. CesiumJS owns the 2D/3D scene and streams Cesium World Terrain through a restricted Cesium ion token. The prototype does not connect to Henro Hub production infrastructure, Supabase, PMTiles, or native apps.

**Tech Stack:** Current stable Vite, React, TypeScript, CesiumJS, Vitest, React Testing Library, Vercel static deployment.

**Spec:** `docs/superpowers/specs/2026-09-06-open-heritage-trails-prototype-design.md`

## Global Constraints

- Use current stable package releases at implementation time; do not copy dependency versions from Henro Hub.
- Keep the repository standalone and public.
- Code is Apache-2.0; geographic data licensing and attribution are handled separately.
- Do not connect to Henro Hub production services, Supabase, PMTiles, auth, or native wrappers in V0.1.
- Do not implement full-network vector tiling, offline Cesium, synchronized elevation charts, fly-through storytelling, or an editor/admin system in V0.1.
- The default scene opens in 3D; users can switch between 3D and 2D.
- Never hard-code Cesium ion credentials in source control. Use `VITE_CESIUM_ION_ACCESS_TOKEN` and document URL restriction for the deployed token.
- Do not fabricate cultural or practical POI content. The final public POI file must contain only user-approved data.

---

### Task 1: Scaffold the modern application and test harness

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Produces: a buildable React/Vite application with `npm run dev`, `npm run test`, and `npm run build`.
- Produces: Cesium static assets copied into the built app and `CESIUM_BASE_URL` configured for runtime asset discovery.

- [ ] **Step 1: Scaffold with current stable packages**

Use current stable package versions at execution time. Install React, React DOM, Cesium, Vite, TypeScript, Vitest, jsdom, React Testing Library, `@testing-library/jest-dom`, and `vite-plugin-static-copy`. Do not pin versions copied from Henro Hub.

- [ ] **Step 2: Configure Cesium assets in Vite**

In `vite.config.ts`, use `vite-plugin-static-copy` to copy Cesium `Workers`, `Assets`, `Widgets`, and `ThirdParty` directories from `node_modules/cesium/Build/Cesium` into `dist/cesium`, and define `CESIUM_BASE_URL` as `/cesium`.

- [ ] **Step 3: Add an environment contract**

`.env.example` must contain exactly:

```text
VITE_CESIUM_ION_ACCESS_TOKEN=
```

`.gitignore` must exclude `.env`, `.env.local`, `.env.*.local`, `node_modules`, `dist`, and test coverage output while retaining `.env.example`.

- [ ] **Step 4: Write a smoke test before the real viewer exists**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the project identity', () => {
    render(<App />);
    expect(screen.getByText('Open Heritage Trails')).toBeInTheDocument();
    expect(screen.getByText(/Shikoku Henro/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run tests and build**

Run:

```text
npm test -- --run
npm run build
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

Commit message:

```text
chore: scaffold Open Heritage Trails app
```

---

### Task 2: Define the reusable trail-data contract and load the T11→T12 demo

**Files:**
- Create: `src/types/trail.ts`
- Create: `src/data/loadDemo.ts`
- Create: `src/data/loadDemo.test.ts`
- Use: `public/demo/shikoku-henro/t11-t12/trail.geojson`
- Use: `public/demo/shikoku-henro/t11-t12/metadata.json`
- Use when provenance is confirmed: `public/demo/shikoku-henro/t11-t12/elevation-profile.json`

**Interfaces:**
- Produces: `TrailMetadata` type.
- Produces: `loadTrailMetadata(): Promise<TrailMetadata>`.
- Produces: `getTrailGeoJsonUrl(): string`.

Define `TrailMetadata` exactly as:

```ts
export interface TrailMetadata {
  id: string;
  title: string;
  subtitle: string;
  from: { id: string; name: string; templeNumber?: number };
  to: { id: string; name: string; templeNumber?: number };
  distanceM: number;
  ascentM: number;
  descentM: number;
  minElevationM: number;
  maxElevationM: number;
  sourceAttribution: string;
  dataLicense: string;
}
```

- [ ] **Step 1: Write loader tests**

Mock `fetch` and verify that `loadTrailMetadata()` validates required numeric and string fields and throws `Invalid trail metadata` if required fields are missing.

- [ ] **Step 2: Implement the loader**

`loadTrailMetadata()` fetches `/demo/shikoku-henro/t11-t12/metadata.json`, validates the required fields, and returns a `TrailMetadata` object. `getTrailGeoJsonUrl()` returns `/demo/shikoku-henro/t11-t12/trail.geojson`.

- [ ] **Step 3: Verify demo files parse**

Add a small Node/Vitest fixture test that reads the committed GeoJSON and asserts:

```ts
expect(collection.type).toBe('FeatureCollection');
expect(collection.features).toHaveLength(1);
expect(collection.features[0].geometry.type).toBe('LineString');
expect(collection.features[0].geometry.coordinates.length).toBeGreaterThan(100);
```

- [ ] **Step 4: Run tests**

Run:

```text
npm test -- --run src/data/loadDemo.test.ts
```

Expected: exit 0.

- [ ] **Step 5: Commit**

Commit message:

```text
feat: add reusable trail data contract
```

---

### Task 3: Create the Cesium viewer with World Terrain

**Files:**
- Create: `src/cesium/createViewer.ts`
- Create: `src/cesium/createViewer.test.ts`
- Create: `src/components/CesiumScene.tsx`
- Create: `src/components/CesiumScene.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `createViewer(container: HTMLElement): Promise<Viewer>`.
- Produces: `<CesiumScene />` that creates exactly one Viewer and destroys it on unmount.

- [ ] **Step 1: Write lifecycle tests**

Mock Cesium `Viewer` creation/destruction and assert that mounting `CesiumScene` creates one viewer and unmounting calls `destroy()` once.

- [ ] **Step 2: Implement the viewer factory**

`createViewer()` must:

- read `import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN`;
- throw a clear error if the token is absent;
- assign the token to `Ion.defaultAccessToken`;
- load `Terrain.fromWorldTerrain()`;
- create a Viewer with timeline, animation, geocoder, homeButton, baseLayerPicker, sceneModePicker, and fullscreenButton disabled;
- enable depth testing against terrain;
- leave the scene in 3D on first load.

- [ ] **Step 3: Add a visible token/configuration error state**

If viewer creation fails, `CesiumScene` renders a compact error card rather than a blank canvas.

- [ ] **Step 4: Run lifecycle tests and build**

Run:

```text
npm test -- --run src/cesium/createViewer.test.ts src/components/CesiumScene.test.tsx
npm run build
```

Expected: exit 0.

- [ ] **Step 5: Commit**

Commit message:

```text
feat: add Cesium World Terrain viewer
```

---

### Task 4: Render the T11→T12 trail and endpoint temples on terrain

**Files:**
- Create: `src/cesium/loadTrail.ts`
- Create: `src/cesium/loadTrail.test.ts`
- Create: `src/cesium/camera.ts`
- Create: `src/cesium/camera.test.ts`
- Modify: `src/components/CesiumScene.tsx`

**Interfaces:**
- Produces: `loadTrail(viewer: Viewer, url: string): Promise<GeoJsonDataSource>`.
- Produces: `fitTrail(viewer: Viewer, source: GeoJsonDataSource): Promise<void>`.
- Produces: `flyToEndpoint(viewer: Viewer, longitude: number, latitude: number, heightM: number): Promise<void>`.

- [ ] **Step 1: Write route-style tests**

Mock a GeoJSON polyline entity and assert that `loadTrail()` assigns a visible polyline material and `clampToGround: true` behavior through Cesium's ground-clamping support.

- [ ] **Step 2: Implement route loading**

Load the committed GeoJSON with `GeoJsonDataSource.load(url, { clampToGround: true })`, add it to `viewer.dataSources`, and apply one consistent route style to all polyline entities.

- [ ] **Step 3: Implement camera helpers**

`fitTrail()` flies to the trail data source with an oblique heading/pitch suitable for mountain comprehension. `flyToEndpoint()` flies to a temple coordinate without changing application state.

- [ ] **Step 4: Add prominent T11/T12 endpoint markers**

Read endpoint coordinates from `metadata.json` only if coordinate fields have been added there; otherwise derive endpoints from the first and final coordinate of the trail LineString. Labels must read `T11 Fujiidera` and `T12 Shōsanji`.

- [ ] **Step 5: Run tests and build**

Run:

```text
npm test -- --run src/cesium/loadTrail.test.ts src/cesium/camera.test.ts
npm run build
```

Expected: exit 0.

- [ ] **Step 6: Commit**

Commit message:

```text
feat: render Shikoku Henro demo trail
```

---

### Task 5: Add route information and 2D/3D controls

**Files:**
- Create: `src/components/TrailPanel.tsx`
- Create: `src/components/TrailPanel.test.tsx`
- Create: `src/components/ViewControls.tsx`
- Create: `src/components/ViewControls.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/CesiumScene.tsx`

**Interfaces:**
- `TrailPanel` consumes `TrailMetadata`.
- `ViewControls` consumes callbacks `on3D`, `on2D`, `onFitRoute`, `onTemple11`, `onTemple12`.

- [ ] **Step 1: Write UI tests**

Verify that `TrailPanel` formats 11,614 m as `11.6 km`, renders ascent/descent in metres, and displays both temple names. Verify all five control buttons are keyboard-accessible and call their callbacks once.

- [ ] **Step 2: Implement `TrailPanel`**

Display title, subtitle, distance, ascent, descent, minimum/maximum elevation, and source attribution. Do not add an elevation chart.

- [ ] **Step 3: Implement `ViewControls`**

Use Cesium `scene.morphTo3D()` and `scene.morphTo2D()` for the dimension switch. Fit-route and temple buttons use the camera helpers from Task 4.

- [ ] **Step 4: Run tests**

Run:

```text
npm test -- --run src/components/TrailPanel.test.tsx src/components/ViewControls.test.tsx
```

Expected: exit 0.

- [ ] **Step 5: Commit**

Commit message:

```text
feat: add trail stats and view controls
```

---

### Task 6: Add user-approved cultural and practical POIs

**Prerequisite:** Before this task is executed for the grant-ready build, the project owner supplies the exact approved POI records. The implementation must not invent names, descriptions, coordinates, or cultural claims.

**Files:**
- Create: `public/demo/shikoku-henro/t11-t12/pois.geojson`
- Create: `src/cesium/loadPois.ts`
- Create: `src/cesium/loadPois.test.ts`
- Create: `src/components/PoiCard.tsx`
- Create: `src/components/PoiCard.test.tsx`
- Modify: `src/components/CesiumScene.tsx`

**Interfaces:**
- Produces: `loadPois(viewer: Viewer, url: string): Promise<GeoJsonDataSource>`.
- POI GeoJSON properties: `id`, `name`, `category`, `description`, optional `henroHubUrl`.

- [ ] **Step 1: Validate the POI GeoJSON schema**

Write tests that reject a feature without `id`, `name`, `category`, or `description`.

- [ ] **Step 2: Implement POI loading**

Load POIs as a GeoJSON data source, set marker styling by a small fixed category map, and ensure markers remain visible against terrain.

- [ ] **Step 3: Implement click selection**

Use Cesium picking to map an entity click to the POI properties and expose the selected record to React state.

- [ ] **Step 4: Implement `PoiCard`**

Render the exact user-approved title, category, description, and optional `View in Henro Hub` link. Do not render missing fields as placeholder text.

- [ ] **Step 5: Run tests and build**

Run:

```text
npm test -- --run src/cesium/loadPois.test.ts src/components/PoiCard.test.tsx
npm run build
```

Expected: exit 0.

- [ ] **Step 6: Commit**

Commit message:

```text
feat: add cultural trail POIs
```

---

### Task 7: Polish responsive layout, attribution, and accessibility

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.tsx`
- Create: `src/components/AboutBadge.tsx`
- Create: `src/components/AboutBadge.test.tsx`

**Interfaces:**
- Produces: a full-viewport terrain-first layout usable on current desktop Chrome/Safari and a basic mobile viewport.

- [ ] **Step 1: Add responsive layout rules**

Desktop: trail panel overlays the upper-left without blocking central terrain. Mobile: panel collapses into a compact top/bottom sheet and controls remain reachable without horizontal scrolling.

- [ ] **Step 2: Add project and attribution links**

Render `Open Heritage Trails`, `Open-source demonstration powered by CesiumJS`, repository link, Henro Hub reference link, and required source/terrain/imagery attribution without obscuring Cesium's mandatory credits.

- [ ] **Step 3: Add accessibility checks**

Ensure interactive controls have visible labels, keyboard focus, and no color-only meaning. Preserve Cesium canvas functionality.

- [ ] **Step 4: Run full verification**

Run:

```text
npm test -- --run
npm run build
```

Expected: exit 0.

- [ ] **Step 5: Commit**

Commit message:

```text
feat: polish grant prototype interface
```

---

### Task 8: Prepare public deployment and grant-support documentation

**Files:**
- Create: `README.md`
- Create: `DATA_LICENSE.md`
- Create: `VERCEL.md`
- Modify: `.env.example`

**Interfaces:**
- Produces: reproducible local setup instructions and a public deployment checklist.

- [ ] **Step 1: Write README setup**

Document prerequisites, `npm install`, `.env.local` token setup, `npm run dev`, `npm test -- --run`, and `npm run build`. Explain that Henro Hub is the first reference platform but not a runtime dependency.

- [ ] **Step 2: Document licensing**

`README.md` states code is Apache-2.0. `DATA_LICENSE.md` identifies the exact route and elevation sources and their licenses once provenance has been confirmed; do not label geographic data Apache-2.0.

- [ ] **Step 3: Document Vercel deployment**

`VERCEL.md` must state that `VITE_CESIUM_ION_ACCESS_TOKEN` is configured in Vercel project environment variables and that the final Cesium ion token must be restricted to the public deployment hostname.

- [ ] **Step 4: Verify from a clean install**

Run from a clean checkout or equivalent clean dependency state:

```text
npm ci
npm test -- --run
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 5: Browser smoke test**

Verify manually in current Chrome and Safari desktop:

- public app loads without login;
- World Terrain renders;
- route follows terrain;
- T11/T12 controls work;
- 2D/3D morph works;
- approved POIs open their cards;
- no uncaught console errors occur during the core flow.

- [ ] **Step 6: Commit**

Commit message:

```text
docs: prepare Open Heritage Trails public release
```

---

## Final Acceptance Gate

Before this prototype is linked from the Cesium grant application, verify all of the following with fresh evidence:

1. Public URL works without login.
2. Public GitHub repo builds from documented instructions.
3. Cesium World Terrain loads reliably.
4. T11→T12 route visibly follows terrain.
5. T11 and T12 can be selected.
6. User-approved POIs load from external structured data, not hard-coded JSX.
7. Clicking a POI shows its metadata.
8. Fit-route/reset camera behavior works.
9. Current Chrome and Safari desktop pass the core flow.
10. Basic mobile viewport does not break.
11. Cesium token is application-restricted.
12. Code/data licensing and attribution are explicit.
13. No production Henro Hub infrastructure is required.
