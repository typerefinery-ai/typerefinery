# Issue 54: CISA CSET Analysis And Design

## Status

Complete.

## Decision

Do not onboard `CISA CSET` as a repo-packaged TypeRefinery local service.

Treat it as an external Windows application with its own installer workflow.

## Upstream Source

- Issue: `#54` New Service - CISA CSET
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/54`
- Upstream repo: `https://github.com/cisagov/cset`
- Latest release: `v12.4.0.4`
- Latest standalone asset: `CSETStandAloneV12404.exe`
- Standalone asset size: about `1.43 GB`
- License: `MIT`

## What The Upstream Project Is

CSET is not a simple static or lightweight local web app.

Relevant upstream facts:

- the standalone installer is for Windows
- standalone install includes front-end, back-end, and local database on the same machine
- the installer may add SQL Server 2022 LocalDB
- the installer may add .NET 7 and ASP.NET Core 7 runtimes
- local development requires Windows, Node, Angular, Visual Studio 2022, and database setup

This is a heavyweight Windows application and service stack with its own installer, not a normal TypeRefinery packaged service.

## TypeRefinery Fit

This does not fit the current TypeRefinery local service pattern.

It is a fit only for:

- external installer coordination
- installed-app discovery
- optional launcher or URL shortcut after installation

It is not a fit for:

- repo-local packaged runtime files
- small service zip onboarding
- straightforward `service.json` extraction plus run

## Implementation Design

### Base Onboarding Decision

Reject direct repo-packaged onboarding.

Do not create:

- `services/cset/service.json`

as the first implementation step.

### Correct First Integration Pattern

Use one of these later:

- external installer guide plus launch shortcut
- installed-instance detector plus URL opener

### Local Port Decision

- not fixed yet

Reason:

- the provided standalone installation docs do not state a single stable local web port for the packaged standalone deployment
- assigning a port now would be guesswork

### Healthcheck Decision

- `N/A` until an installed-instance endpoint is verified

### Traefik Decision

- `No` for base onboarding

Do not add Traefik routes before the actual installed runtime endpoint is known.

## Scope

### In Scope

- documenting that CSET is an external installer-driven product
- defining a future launcher/integration path

### Out Of Scope

- bundling the upstream 1.43 GB installer into this repo
- repackaging SQL Server LocalDB and .NET runtime dependencies
- pretending the app is a normal small local web service

## Blockers

- heavyweight external installer
- Windows runtime prerequisites
- local database dependency
- no confirmed fixed localhost endpoint from the provided standalone docs

## Recommendation

Split this into two future tracks:

1. documented external install flow
2. post-install TypeRefinery integration once the runtime endpoint is validated on a real machine

## Done When

This analysis is complete because the correct call is explicit:

- CSET should not be treated as a standard TypeRefinery local service
- the issue needs an external-installer integration pattern

## Source URLs

- `https://github.com/cisagov/cset`
- `https://github.com/cisagov/cset/releases/latest`
- `https://github.com/cisagov/cset/tree/develop/install-and-troubleshooting-guides`
