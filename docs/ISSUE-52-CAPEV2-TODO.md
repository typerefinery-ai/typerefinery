# Issue 52: CAPEv2 Analysis And Design

## Status

Complete.

## Decision

Do not onboard `CAPEv2` as a normal TypeRefinery local service.

Treat this as an external malware-sandbox infrastructure integration, not as an installable repo-local service.

## Upstream Source

- Issue: `#52` New Service - CAPEv2
- Issue URL: `https://github.com/os-threat/os-threat-alpha-1-program/issues/52`
- Upstream repo: `https://github.com/kevoreilly/CAPEv2`
- Documentation: `https://capev2.readthedocs.io/en/latest/`
- License in repo metadata: `NOASSERTION / Other`

## What The Upstream Project Is

CAPEv2 is a malware sandbox platform with:

- Linux host services
- hypervisor integration
- Windows guest VMs
- multiple system services
- network routing and isolation
- web UI plus backend processors

Relevant upstream facts:

- upstream recommends Ubuntu `24.04 LTS`
- KVM is the recommended hypervisor
- Windows 10 or Windows 11 guests are expected
- installation scripts create and manage multiple CAPE services
- the project is not described as a lightweight local web service

## TypeRefinery Fit

This does not fit the current TypeRefinery local service pattern.

It is not a realistic candidate for:

- unpacked local service files
- single-process startup
- trivial tab exposure

It is an infrastructure system.

## Implementation Design

### Base Onboarding Decision

Reject direct local onboarding in this repo.

Do not create:

- `services/capev2/service.json`

as the first implementation step.

### Correct First Integration Pattern

If this project must appear in TypeRefinery, the correct first implementation is:

- external deployment documentation
- optional external URL connector
- optional reverse proxy to an already-provisioned CAPE instance

### Local Port Decision

- `N/A` for direct local onboarding

Do not assign a fake local TypeRefinery port to imply that CAPE can be bundled and started like a normal local service.

### Healthcheck Decision

- `N/A` for direct local onboarding

Healthchecks only make sense after an external deployment pattern is chosen and verified.

### Traefik Decision

- `No` for base onboarding

Do not add Traefik routes until there is a real deployed CAPE web endpoint to proxy.

## Scope

### In Scope

- documenting that CAPE is external infrastructure
- defining a future connector pattern

### Out Of Scope

- hypervisor provisioning
- guest VM creation
- local Linux host setup
- network isolation setup
- malware detonation pipeline inside this repo

## Blockers

- upstream host model is Linux-first
- hypervisor and VM dependencies are mandatory
- security and isolation requirements are significant
- repo license metadata is not a clean SPDX open-source match for redistribution assumptions

## Recommendation

Split this work into two future cards:

1. external CAPE deployment guide
2. TypeRefinery connector or reverse-proxy integration for an existing CAPE instance

## Done When

This analysis is complete because the correct call is now explicit:

- CAPEv2 is not a normal TypeRefinery local service
- the issue needs a different delivery pattern

## Source URLs

- `https://github.com/kevoreilly/CAPEv2`
- `https://capev2.readthedocs.io/en/latest/`
- `https://capev2.readthedocs.io/en/latest/introduction/what.html`
- `https://capev2.readthedocs.io/en/latest/usage/dist.html`
