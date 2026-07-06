# Issue 46: Complete Attack Workbench Analysis And Design

## Status

Complete.

## Decision

Do not implement `Attack Workbench` as a simple unpacked local service.

Implement it as a Docker-orchestrated composite service stack.

This is the correct fit for the upstream architecture and the official deployment model.

## Upstream Source

- Issue: `#46` New Service - Complete Attack Workbench
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/46`
- Frontend repo: `https://github.com/center-for-threat-informed-defense/attack-workbench-frontend`
- REST API repo: `https://github.com/center-for-threat-informed-defense/attack-workbench-rest-api`
- TAXII repo: `https://github.com/mitre-attack/attack-workbench-taxii-server`
- Deployment repo: `https://github.com/mitre-attack/attack-workbench-deployment`
- Frontend license: `Apache-2.0`
- REST API license: `Apache-2.0`
- TAXII server license: `Apache-2.0`

## What The Upstream Project Is

Attack Workbench is not one service. It is a stack made of:

- Angular frontend
- Node.js REST API
- MongoDB database
- optional Node.js TAXII server

The frontend documentation states:

- the full application needs frontend, REST API, and database
- Docker is the recommended deployment method
- Docker Compose is the only officially supported deployment method

The deployment repo provides:

- `compose.yaml` for prebuilt images
- `compose.dev.yaml` for local source builds
- optional TAXII profile

## TypeRefinery Fit

This does not fit the same pattern as lightweight static services such as Attack Navigator.

It is still workable in TypeRefinery, but only if it is treated as:

- a composite stack
- Docker managed
- externally orchestrated from a single service folder

Do not try to repackage the whole stack as local unpacked files plus raw `service.json` commands for each component as the first implementation.

## Implementation Design

### Onboarding Model

Create one coordinator service:

- `services/attack-workbench/`

This service should:

- hold a pinned upstream Docker Compose definition
- hold local `.env` templates
- start and stop the whole stack
- expose the primary frontend health state to TypeRefinery

### Required External Runtime

- Docker Desktop or equivalent Docker Engine support

This is a hard prerequisite.

### Preferred Upstream Mode

Use upstream prebuilt container images first.

Do not start with local source builds as the default install path.

Reason:

- upstream already supports GHCR image deployment
- it avoids bundling frontend/API build toolchains into TypeRefinery
- it stays aligned with the officially supported deployment path

### Component Ports

Use these local bindings:

- frontend: `4310`
- REST API: `4311`
- TAXII: `4312`
- MongoDB: internal to Compose unless direct access is explicitly needed later

### Healthchecks

Use:

- frontend healthcheck: `http://localhost:4310/`
- REST API validation: `http://localhost:4311/api-docs`
- TAXII validation: `http://localhost:4312/taxii2/`

TypeRefinery’s primary service healthcheck should target the frontend URL.

### Traefik

Expose:

- `https://attack-workbench.typerefinery.localhost:8101`
- `https://attack-workbench-api.typerefinery.localhost:8101`
- `https://attack-workbench-taxii.typerefinery.localhost:8101`

## Required Repo Changes

Create:

- `services/attack-workbench/service.json`
- `services/attack-workbench/docker-compose.yml`
- `services/attack-workbench/.env.template`
- `services/attack-workbench/.gitignore`
- `services/attack-workbench/start.ps1`
- `services/attack-workbench/stop.ps1`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- Docker-backed stack startup
- frontend, REST API, and optional TAXII service exposure
- fixed local port mapping
- Traefik exposure

### Out Of Scope

- automatic Attack Navigator TAXII integration
- custom collection workflows inside TypeRefinery UI
- custom authentication or SSO integration
- deep Workbench customization

## Risks And Constraints

- This service cannot be treated as install-free.
- Docker is a hard dependency.
- MongoDB persistence needs an explicit volume strategy.
- Session secret and other env values must be set correctly for the REST API.

## Done When

- Docker-backed stack starts from one TypeRefinery service entry
- frontend is healthy on `4310`
- API is reachable on `4311`
- TAXII is reachable on `4312` when enabled
- Traefik routes resolve correctly

## Source URLs

- `https://github.com/center-for-threat-informed-defense/attack-workbench-frontend`
- `https://github.com/center-for-threat-informed-defense/attack-workbench-rest-api`
- `https://github.com/mitre-attack/attack-workbench-taxii-server`
- `https://github.com/mitre-attack/attack-workbench-deployment`
