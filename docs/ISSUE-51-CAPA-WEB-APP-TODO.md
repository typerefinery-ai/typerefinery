# Issue 51: capa Web App Analysis And Design

## Status

Complete.

## Decision

Add the `capa Web App` as a packaged static web service.

Target the upstream `web/explorer` application only.

## Upstream Source

- Issue: `#51` New Service - capa Web App
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/51`
- Upstream repo: `https://github.com/mandiant/capa`
- Web app path: `web/explorer`
- Latest main project release: `v9.4.0`
- Web app package name: `capa-webui`
- License: `Apache-2.0`

## What The Upstream Project Is

The `capa` repository is primarily a malware capability analysis project, but the web UI is a separate browser-based explorer application under `web/explorer`.

Relevant upstream facts:

- the web app is a Vue/Vite project
- it has a `build:bundle` script that outputs a standalone offline bundle
- upstream README says users can run it locally by downloading the offline release or by opening the app in a browser
- the UI is meant to visualize capa results, not to run malware analysis itself

That means the correct onboarding target is the browser explorer only.

## TypeRefinery Fit

This is a strong fit for the TypeRefinery service model because:

- it is a standalone web UI
- it can be built as static assets
- it does not need a backend for basic use

## Build And Packaging Design

### Version To Pin

Pin onboarding to:

- `v9.4.0`

### Build Input

- upstream checkout of `mandiant/capa`
- build from `web/explorer`

### Build Requirements

Recommended build target:

- Node `22`

### Build Command

Use:

- `npm ci`
- `npm run build:bundle`

### Packaged Runtime

Package:

- generated `capa-explorer-web` output
- local `server.js`
- local `service.json`
- local `.gitignore`
- packaging script

Do not package:

- Python capa runtime
- rules engine
- analysis backends

## Runtime Design

### Runtime Type

- static web app
- served locally by Node static server

### Runtime Service

- TypeRefinery `node` service

### Fixed Port

- `4216`

### Healthcheck

- HTTP
- `http://localhost:4216/`
- expected status `200`

### Traefik

Expose through Traefik as:

- `https://capa.typerefinery.localhost:8101`

## Required Repo Changes

Create:

- `services/capa-web/service.json`
- `services/capa-web/.gitignore`
- `services/capa-web/build.package.ps1`
- `services/capa-web/runtime/server.js`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- local explorer UI
- static packaging
- fixed port
- healthcheck
- Traefik exposure

### Out Of Scope

- running capa CLI analysis jobs
- CAPE integration
- Ghidra integration
- workflow-specific TypeRefinery automation

## Done When

- offline bundle builds successfully
- service starts on `4216`
- healthcheck passes
- app opens through Traefik

## Source URLs

- `https://github.com/mandiant/capa`
- `https://github.com/mandiant/capa/tree/master/web/explorer`
- `https://mandiant.github.io/capa/explorer/#/`
