# Issue 50: Mitre Caldera Analysis And Design

## Status

Complete.

## Decision

Do not onboard `Mitre Caldera` as a native unpacked TypeRefinery service on Windows.

If this card proceeds, implement it as a Docker-backed external service wrapper with strict local-only exposure.

## Upstream Source

- Issue: `#50` New service - Mitre Caldera
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/50`
- Upstream repo: `https://github.com/mitre/caldera`
- Latest release: `5.3.0`
- License: `Apache-2.0`

## What The Upstream Project Is

Caldera is a full adversary emulation platform with:

- a Python core server
- REST API
- web interface
- plugin system
- agent ecosystem

Upstream documentation states:

- direct core requirements are Linux or macOS
- Python `3.10+` is required
- Node `16+` is recommended for the v5 UI build path
- Docker installation is supported
- the app is available at `http://localhost:8888`
- default insecure startup uses `red/admin`
- the project should not be exposed to the internet and is not described as a hardened web app

## TypeRefinery Fit

This is not a good fit for the normal unpacked TypeRefinery service pattern on a Windows workstation.

It is a reasonable fit only as:

- a Docker-backed local service
- or an external deployment TypeRefinery links to

Because the user story only asks for the service to run and open in a tab, the right design is a Docker wrapper, not source packaging.

## Implementation Design

### Onboarding Model

Create:

- `services/caldera/`

This service should manage:

- Docker image startup
- local bind port
- healthcheck
- optional Traefik route

### Required External Runtime

- Docker Desktop with WSL2 or equivalent Docker Engine support

This is a hard prerequisite.

### Version To Pin

- `ghcr.io/mitre/caldera:5.3.0`

Do not use floating `latest` for onboarding.

### Fixed Port

- `4315`

Use Docker host mapping from container `8888` to local `4315`.

### Healthcheck

- HTTP
- `http://localhost:4315/`
- expected status `200`

### Traefik

Expose only as a local development host:

- `https://caldera.typerefinery.localhost:8101`

Do not document this as internet-safe.

## Required Repo Changes

Create:

- `services/caldera/service.json`
- `services/caldera/docker-compose.yml` or equivalent Docker run wrapper
- `services/caldera/.env.template`
- `services/caldera/.gitignore`
- `services/caldera/start.ps1`
- `services/caldera/stop.ps1`

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Do not change in base onboarding:

- `src/data/default.json`

## Scope

### In Scope

- local container launch
- tab access to the web UI
- local-only Traefik exposure
- pinned version

### Out Of Scope

- agent deployment
- plugin expansion beyond upstream container defaults
- secure enterprise hardening
- public exposure
- operational red-team workflows

## Security Constraints

- Caldera should not be treated as a hardened public web application.
- Default credentials and insecure startup behavior must be replaced or isolated.
- This service must remain local-only in normal TypeRefinery usage.

## Done When

- Docker-backed Caldera starts locally
- UI is reachable on `4315`
- healthcheck passes
- local Traefik route works

## Source URLs

- `https://github.com/mitre/caldera`
- `https://github.com/mitre/caldera/releases/tag/5.3.0`
- `https://caldera.readthedocs.io/en/latest/`
