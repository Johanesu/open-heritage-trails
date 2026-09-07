# Codex Start Instructions

## Repository

`Johanesu/open-heritage-trails`

Work locally in this repository. Do not modify any Henro Hub repository, deployment, Supabase project, PMTiles infrastructure, auth system, or native wrapper.

## Read first

Before making changes, read these files in full:

1. `docs/superpowers/specs/2026-09-06-open-heritage-trails-prototype-design.md`
2. `docs/superpowers/plans/2026-09-06-open-heritage-trails-prototype.md`
3. `docs/data-review-2026-09-06.md`
4. `DATA_LICENSE.md`
5. `CONTRIBUTING.md`
6. `public/demo/shikoku-henro/t11-t12/README.md`
7. `public/demo/shikoku-henro/t11-t12/SOURCE.md`

The initial demo data is under `public/demo/shikoku-henro/t11-t12/`. `pois.geojson` is intentionally empty until approved POIs are supplied.

## Current task

Execute **Task 1 only** from the implementation plan and GitHub issue #1:

`https://github.com/Johanesu/open-heritage-trails/issues/1`

Do not proceed to Task 2 automatically.

## Constraints

- Use current stable package versions at implementation time.
- Do not copy dependency versions from Henro Hub.
- Do not commit a Cesium ion token or any credential.
- Keep the project standalone.
- Preserve all existing data/provenance files.

## Verification before stopping

Run the complete Task 1 verification from the implementation plan, including:

- test suite for Task 1;
- production build;
- inspection of the resulting Git diff.

Then report:

1. files created/changed;
2. exact dependency versions installed;
3. test command and result;
4. build command and result;
5. commit SHA;
6. any deviation from the plan and why.

Stop after Task 1 is committed successfully.
