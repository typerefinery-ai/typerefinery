# Issue 44: Attack Navigator Analysis And Design

## Status

Complete.

## Decision

Add `Attack Navigator` as a packaged static web service.

This fits the current TypeRefinery service model and should be implemented as:

- source build on a build machine
- packaged runtime files only
- lightweight local Node static server
- Traefik exposure

Do not use Angular dev server as the shipped runtime.

## Upstream Source

- Issue: `#44` New Service - Attack Navigator Service
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/44`
- Upstream repo: `https://github.com/mitre-attack/attack-navigator`
- Upstream release target from issue: `v5.3.0`
- Upstream release date: `2026-01-15`
- Current upstream `nav-app/package.json` version on `master`: `5.3.1`
- License: `Apache-2.0`

## What The Upstream Project Is

Attack Navigator is a client-side Angular web application for viewing and annotating ATT&CK matrices.

Relevant upstream facts:

- the runnable app is in `nav-app/`
- local dev startup is `ng serve`
- production build is `ng build --configuration production`
- runtime output is `nav-app/dist/browser/`
- runtime config is loaded from `nav-app/src/assets/config.json`
- the app is explicitly embeddable in an `iframe`

Important config note:

- current code uses `custom_context_menu_items`
- the older README text still refers to `custom_context_menu_options`

For implementation, use the current code and config key, not the outdated README wording.

## TypeRefinery Fit

This is a good fit for the existing TypeRefinery local service pattern because:

- it is a single web UI
- it has no required backend for base operation
- it can be built once and served as static files
- it can be exposed safely through the existing Traefik pattern

## Build And Packaging Design

### Build Input

- upstream checkout of `mitre-attack/attack-navigator`
- build from `nav-app/`

### Build Requirements

- Node `22`
- Angular CLI `19`

### Build Output

- `nav-app/dist/browser/`

### Packaged Runtime

Package only:

- built static files
- local `server.js`
- local `service.json`
- local `.gitignore`
- packaging script

Do not package:

- `node_modules`
- Angular CLI
- dev source tree for runtime use

### Archive Format

Package using:

- `services/_archive/win32/7za.exe`

Archive rule:

- split `7z` volumes
- `50m` part size

Expected archive pattern:

- `attack-navigator.7z.001`
- `attack-navigator.7z.002`
- additional parts as required

## Runtime Design

### Runtime Type

- static web app
- served by local Node static server

### Runtime Service

- TypeRefinery `node` service

### Fixed Port

- `4210`

### Healthcheck

- HTTP
- `http://localhost:4210/`
- expected status `200`

### Traefik

Expose through Traefik as:

- `https://attack-navigator.typerefinery.localhost:8101`

Add:

- new Traefik global URL variable
- router entries
- load balancer entry

## Required Repo Changes

Create or maintain:

- `services/attack-navigator/service.json`
- `services/attack-navigator/.gitignore`
- `services/attack-navigator/build.package.ps1`
- `services/attack-navigator/runtime/server.js`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- local service packaging
- static runtime server
- fixed port
- healthcheck
- Traefik exposure
- local service discovery/start/stop

### Out Of Scope

- custom context menu items that call local APIs
- transport endpoints for copying ATT&CK objects into incidents
- CMS embed wiring
- modal overrides for `view technique` and `view tactic`
- downstream ATT&CK or STIX workflow logic

Those items need separate follow-up implementation work after the base service is running.

## Recommended Implementation Files

- `services/attack-navigator/service.json`
- `services/attack-navigator/.gitignore`
- `services/attack-navigator/build.package.ps1`
- `services/attack-navigator/runtime/server.js`
- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

## Done When

- packaged archive is produced
- service extracts and starts locally
- healthcheck passes on `4210`
- service appears in the TypeRefinery service list
- app is reachable through Traefik

## Source URLs

- `https://github.com/mitre-attack/attack-navigator`
- `https://github.com/mitre-attack/attack-navigator/releases/tag/v5.3.0`
- `https://github.com/mitre-attack/attack-navigator/blob/master/README.md`
- `https://github.com/mitre-attack/attack-navigator/blob/master/nav-app/package.json`
- `https://github.com/mitre-attack/attack-navigator/blob/master/nav-app/src/assets/config.json`
