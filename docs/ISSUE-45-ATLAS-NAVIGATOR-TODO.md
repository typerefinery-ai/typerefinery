# Issue 45: Atlas Navigator Analysis And Design

## Status

Complete.

## Decision

Add `Atlas Navigator` as a packaged static web service.

This should use the same TypeRefinery onboarding shape as Attack Navigator, but with its own pinned upstream source, separate build toolchain, separate config, and separate port.

## Upstream Source

- Issue: `#45` New Service - Atlas Navigator
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/45`
- Upstream repo: `https://github.com/mitre-atlas/atlas-navigator`
- Upstream homepage: `https://mitre-atlas.github.io/atlas-navigator`
- Latest upstream tag visible from repo tags: `v4.5.5`
- Current `nav-app/package.json` version on `master`: `4.7.1`
- License: `Apache-2.0`

## What The Upstream Project Is

Atlas Navigator is a fork of MITRE ATT&CK Navigator for ATLAS matrices.

Relevant upstream facts:

- the repository is explicitly a fork of `mitre-attack/attack-navigator`
- it is a web application with a `nav-app/` directory
- `nav-app/package.json` shows Angular `11` era dependencies
- the app is still built with Angular tooling and served as a browser UI
- config is provided via `nav-app/src/assets/config.json`

This means the service shape is similar to Attack Navigator, but the build toolchain is older and should not be assumed to work with the same Node version.

## TypeRefinery Fit

This is a good fit for the TypeRefinery service model because:

- it is a browser-facing web UI
- it has no required backend for basic navigation use
- it can be packaged as built static assets

## Build And Packaging Design

### Version To Pin

Pin the onboarding to:

- upstream tag `v4.5.5`

Do not build from moving `master` by default.

Reason:

- the repo is older and less active than Attack Navigator
- tag pinning reduces toolchain drift

### Build Requirements

Use a dedicated older Node build environment for this service.

Recommended build target:

- Node `16 LTS`

Reason:

- the package is Angular `11` era
- TypeRefinery’s bundled Node `24` should not be assumed compatible with this older build chain

### Build Input

- upstream checkout of `mitre-atlas/atlas-navigator`
- build from `nav-app/`

### Build Output

- Angular production build output from `nav-app/dist/`

### Packaged Runtime

Package only:

- built static files
- local runtime `server.js`
- local `service.json`
- local `.gitignore`
- packaging script

### Archive Format

Use the same packaging standard as other static services:

- bundled `7za.exe`
- split `7z`
- `50m` volumes

## Runtime Design

### Runtime Type

- static web app
- served by local Node static server

### Runtime Service

- TypeRefinery `node` service

### Fixed Port

- `4211`

### Healthcheck

- HTTP
- `http://localhost:4211/`
- expected status `200`

### Traefik

Expose through Traefik as:

- `https://atlas-navigator.typerefinery.localhost:8101`

## Required Repo Changes

Create:

- `services/atlas-navigator/service.json`
- `services/atlas-navigator/.gitignore`
- `services/atlas-navigator/build.package.ps1`
- `services/atlas-navigator/runtime/server.js`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- local service packaging
- static runtime
- fixed port
- healthcheck
- Traefik exposure

### Out Of Scope

- redirecting `view technique` and `view tactic` into local modal UI
- CMS embed wiring
- custom ATLAS transport API endpoints
- custom context menu item implementation

These are follow-up integration tasks, not base service onboarding.

## Special Notes

- Do not assume Atlas Navigator and Attack Navigator share the same build toolchain.
- Keep packaging separate even if the runtime server helper is nearly identical.
- Validate the production output path against the pinned tag when implementation starts.

## Done When

- static package builds from pinned upstream tag
- service starts locally on `4211`
- healthcheck passes
- app is reachable through Traefik

## Source URLs

- `https://github.com/mitre-atlas/atlas-navigator`
- `https://mitre-atlas.github.io/atlas-navigator`
- `https://github.com/mitre-atlas/atlas-navigator/blob/master/README.md`
- `https://github.com/mitre-atlas/atlas-navigator/blob/master/nav-app/package.json`
