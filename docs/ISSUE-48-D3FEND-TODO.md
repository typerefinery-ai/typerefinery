# Issue 48: Mitre D3FEND Analysis And Design

## Status

Complete.

## Decision

Add `Mitre D3FEND` as a packaged static website service.

Do not treat it as a backend application or ontology processor for the first onboarding pass.

## Upstream Source

- Issue: `#48` New Service - Mitre D3FEND
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/48`
- Upstream repo referenced by issue: `https://github.com/d3fend/d3fend`
- Upstream homepage: `https://d3fend.mitre.org`
- License: `MIT`

## What The Upstream Project Is

The upstream repository describes itself as:

- `Public static website for the D3FEND project`

The repo README is minimal and points directly to the public site.

That means the correct first classification is:

- static site content
- no required backend for basic browsing
- no custom local database or worker layer for the base service

## TypeRefinery Fit

This fits the TypeRefinery local service model as a static site mirror.

The correct onboarding target is:

- local mirrored website snapshot
- lightweight static server
- Traefik exposure

Not:

- ontology editing
- data regeneration
- local knowledge graph tooling

## Build And Packaging Design

### Source To Package

Use the upstream `gh-pages` content from `d3fend/d3fend`.

### Packaging Method

Package a static site snapshot.

No build step is required unless a newer upstream publishing pipeline is intentionally adopted later.

### Packaged Runtime

Package:

- static site files
- local `server.js`
- local `service.json`
- local `.gitignore`
- packaging script

### Archive Format

Use:

- bundled `7za.exe`
- split `7z`
- `50m` volumes

## Runtime Design

### Runtime Type

- static website
- served locally by Node static server

### Runtime Service

- TypeRefinery `node` service

### Fixed Port

- `4214`

### Healthcheck

- HTTP
- `http://localhost:4214/`
- expected status `200`

### Traefik

Expose through Traefik as:

- `https://d3fend.typerefinery.localhost:8101`

## Required Repo Changes

Create:

- `services/d3fend/service.json`
- `services/d3fend/.gitignore`
- `services/d3fend/build.package.ps1`
- `services/d3fend/runtime/server.js`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- local hosted D3FEND website
- tab or embed access through URL
- Traefik exposure

### Out Of Scope

- ontology authoring
- local semantic search
- D3FEND data refresh pipeline
- custom TypeRefinery UI integration

## Done When

- local static site package exists
- service starts on `4214`
- healthcheck passes
- site is reachable through Traefik

## Source URLs

- `https://github.com/d3fend/d3fend`
- `https://d3fend.mitre.org`
