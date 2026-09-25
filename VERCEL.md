# Vercel deployment preparation

This document describes a **later** public deployment. No Vercel project, deployment, production token, or domain is created by this preparation task.

## Release gate — confirm before connecting or deploying

The project owner must first confirm:

1. The final public-license status and provenance of the seven SVG glyphs copied from Henro Hub. [`DATA_LICENSE.md`](DATA_LICENSE.md) records this as unresolved; do not assume the Apache-2.0 software license covers them.
2. The exact original route download/source. The likely OpenStreetMap/Waymarked Trails connection remains provisional in the [dataset source notes](public/demo/shikoku-henro/t11-t12/SOURCE.md).
3. A separate production Cesium ion token configured for the final public hostname and the minimum required public scopes.

Do not import/connect the repository to a Vercel project until these gates are cleared if doing so would trigger an automatic deployment. Do not create or paste a production token in the repository or `.env.local`.

## Recommended project settings after approval

- Import the `open-heritage-trails` GitHub repository with the repository root as Vercel's Root Directory.
- Framework Preset: **Vite**.
- Install Command: use Vercel's npm/lockfile default; the repository has `package-lock.json`.
- Build Command: `npm run build` (the package script runs TypeScript and Vite).
- Output Directory: `dist`.
- Set `VITE_CESIUM_ION_ACCESS_TOKEN` in the Vercel **Production** build environment before deploying. Vite embeds `VITE_` values in browser JavaScript; this is a public-client token, not a server-side secret.

This prototype has only the root `/` page and uses absolute paths for demo JSON/GeoJSON, local SVGs, and Cesium files. Vite copies `public/` content into `dist`, while the existing `vite-plugin-static-copy` configuration writes Cesium Workers, Assets, Widgets, and ThirdParty under `dist/cesium`. Keep `CESIUM_BASE_URL=/cesium` unchanged. No `vercel.json` rewrite is needed for the current root-only app; revisit SPA deep-link routing only if client-side routes are added later, without masking missing static assets.

## Production Cesium ion token

- Create a **new token for this public app**; do not reuse the local-development or default Cesium ion token.
- Allow only the minimum required **public** scopes for the app's World Terrain and imagery access (normally `assets:read`; the geocoder is disabled). Do not grant private/write/account scopes. Limit asset access to the required assets where practical.
- Restrict Allowed URLs to the final Vercel production hostname and any explicitly approved custom hostname, using their `https://` origins. Do not add broad wildcard or unrelated preview origins merely for convenience. Check that the app's referrer policy permits the header required by Cesium ion URL restrictions.
- Keep the production token in Vercel project environment settings, not in source control. Check the final hostname, scopes, asset access, and rendered terrain/imagery as part of a separately authorized deployment task.

References: [Vercel's Vite guidance](https://vercel.com/docs/frameworks/frontend/vite), [Vercel build settings](https://vercel.com/docs/builds/configure-a-build), and [Cesium ion access-token guidance](https://cesium.com/learn/ion/cesium-ion-access-tokens/).
