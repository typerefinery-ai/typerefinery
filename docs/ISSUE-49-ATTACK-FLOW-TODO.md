# Issue 49: Attack-Flow Analysis And Design

## Status

Complete.

## Decision

Add `Attack-Flow` as a packaged static web service, targeting the `Attack Flow Builder` UI.

Do not treat the full repo’s Python package, schema tooling, and corpus utilities as part of the base service onboarding.

## Upstream Source

- Issue: `#49` New Service - Attack-Flow
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/49`
- Upstream repo: `https://github.com/center-for-threat-informed-defense/attack-flow`
- Latest release: `v3.0.0`
- License: `Apache-2.0`

## What The Upstream Project Is

Attack Flow is not only a website.

The repo contains:

- a Python package and schema/tooling layer
- documentation and example flows
- a Vue/Vite `Attack Flow Builder` UI under `src/attack_flow_builder`
- a Docker image that exposes the app on `8080:80`

For this board card, the relevant onboarding target is the browser UI because the acceptance criteria only require the service to run and be accessible in a tab.

## TypeRefinery Fit

The `Attack Flow Builder` UI fits the TypeRefinery service model.

The rest of the repo does not need to be onboarded for the base service.

## Build And Packaging Design

### Version To Pin

Pin onboarding to:

- `v3.0.0`

### Build Input

- upstream checkout of `center-for-threat-informed-defense/attack-flow`
- build from `src/attack_flow_builder`

### Build Requirements

Recommended build target:

- Node `22`

Reason:

- the builder package uses modern Vite tooling
- the repo includes `@tsconfig/node22`

### Packaged Runtime

Package:

- built builder static assets
- local `server.js`
- local `service.json`
- local `.gitignore`
- packaging script

Do not package in the first pass:

- Python CLI tooling
- corpus processing utilities
- schema authoring workflow

### Archive Format

- bundled `7za.exe`
- split `7z`
- `50m` volumes

## Runtime Design

### Runtime Type

- static web app
- served locally by Node static server

### Runtime Service

- TypeRefinery `node` service

### Fixed Port

- `4215`

### Healthcheck

- HTTP
- `http://localhost:4215/`
- expected status `200`

### Traefik

Expose through Traefik as:

- `https://attack-flow.typerefinery.localhost:8101`

## Required Repo Changes

Create:

- `services/attack-flow/service.json`
- `services/attack-flow/.gitignore`
- `services/attack-flow/build.package.ps1`
- `services/attack-flow/runtime/server.js`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- local builder UI
- fixed port
- healthcheck
- Traefik exposure

### Out Of Scope

- Python package workflow tooling
- schema validation pipeline integration
- flow corpus generation and publishing
- downstream TypeRefinery domain-specific flow automation

## Done When

- static builder package is produced
- service starts on `4215`
- healthcheck passes
- app opens through Traefik

## Source URLs

- `https://github.com/center-for-threat-informed-defense/attack-flow`
- `https://github.com/center-for-threat-informed-defense/attack-flow/releases/tag/v3.0.0`
- `https://ctid.io/flow`
