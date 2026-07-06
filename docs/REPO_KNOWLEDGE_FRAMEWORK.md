# TypeRefinery Repo Knowledge Framework

## Purpose

This document is a working knowledge framework for the `typerefinery` repository.
It is meant to help contributors quickly answer:

- What this repo is responsible for.
- Which parts of the codebase own which concerns.
- How the desktop app, frontend, and local service stack fit together.
- Where to start when making changes in a specific area.

This should be treated as a living document and updated as the repo evolves.

## One Sentence Summary

TypeRefinery is an Electron desktop application with a Vue 3 frontend that orchestrates a large local service ecosystem for graph, workflow, data, and embedded experience tooling.

## High Level Architecture

At runtime, the repository is composed of three major layers:

1. Renderer app
   The Vue 3 application under `src/` provides the user interface, project workspace, settings, service status UI, workflow screen, and iframe-based experiences.

2. Electron shell
   The Electron code under `electron/` owns the desktop window, preload bridge, IPC, tray behavior, crash/error reporting, startup sequence, and app lifecycle.

3. Local service platform
   The service system under `services/` contains bundled runtimes, databases, proxies, workflow tools, and application services. These are discovered and managed by the Electron service manager.

## Repo Map

### Top Level Directories

- `src/`
  Main Vue renderer application.
- `electron/`
  Electron main-process and preload code, plus desktop build assets.
- `services/`
  Local service definitions, bundled runtimes, and service-specific code/config.
- `scripts/`
  Build helper scripts for Vite and Electron bundles.
- `public/`
  Static public assets used by the renderer build.
- `cypress/`
  End-to-end test specs and Cypress support files.
- `vitest/`
  Vitest setup files.
- `install/`
  Installer and extra runtime resources packaged with the desktop app.
- `dist/`
  Built frontend and Electron output.
- `dist_electron/`
  Packaged Electron artifacts.

### Key Root Files

- `package.json`
  Main project manifest, scripts, app metadata, and Electron Builder config.
- `vite.config.ts`
  Renderer build configuration.
- `tsconfig.json`
  Shared TypeScript config for renderer and Electron app code.
- `README.md`
  Root project setup and release notes.
- `docker-compose.yml`
  Alternate containerized service setup path.

## Main Application Areas

### Renderer Application

Primary location: `src/`

Important entry points:

- `src/main.ts`
  Creates the Vue app and registers router, store, i18n, PrimeVue, and supporting plugins.
- `src/App.vue`
  Root app component. On startup it checks service state, retrieves global environment values from Electron, and listens for service status IPC events.
- `src/router/index.ts`
  Defines the core routes:
  - `/welcome`
  - `/home/:id`
  - `/experience/:id`
  - `/workflow`

### Main Renderer Views

- `src/views/Home.vue`
  Main workspace entry. In Electron it can gate the user behind service installation/startup before showing the project workspace.
- `src/components/Welcome/index.vue`
  Dashboard-style landing page showing experiences, services, and config access.
- `src/components/Project/`
  Largest renderer feature area. Implements the project workspace, sidebar tree, tabs, split views, query editing, themes, connections, outputs, and project metadata.
- `src/components/IframeComponent/index.vue`
  Hosts embedded experiences inside iframes. It resolves `${ENV_VAR}` placeholders using global environment values from the service layer.
- `src/components/Workflow/`
  Workflow screen. Splits the UI between an embedded Flow experience and a graph panel.

### State Management

Primary location: `src/store/Modules/`

The app uses Vuex with `vuex-module-decorators` and persists much of the state in `localStorage`.

Key modules:

- `AppData.ts`
  Tracks selected tree nodes, selected split nodes, dialog visibility, sidebar visibility, and resize/focus UI state.
- `Projects.ts`
  Owns the project-centric domain model: projects, local connections, queries, themes, wirings, output trees, and save/delete flows.
- `Services.ts`
  Owns service list state, service status metadata, and Electron IPC calls for start/stop/restart/get-services/get-global-env.
- `Settings.ts`
  Owns language, theme, focus mode, settings dialog state, and the list of experiences shown in the main menus.
- `Connections.ts`, `Queries.ts`, `Theme.ts`
  Own global versions of the project-scoped data types.

### UI Composition Pattern

A common renderer pattern in this repo is:

- Sidebar tree selects a domain object.
- Selection opens one or more tabs in the main workspace.
- Some content can be split into a secondary pane.
- Save operations persist back to backend services through REST APIs.
- UI metadata and last-opened state are persisted locally.

## Electron Architecture

Primary location: `electron/app/`

### Main Process

Key file: `electron/app/main/index.ts`

Responsibilities:

- Create and manage the frameless desktop window.
- Show splash screen and tray icon.
- Configure crash reporting and Sentry integration.
- Build the preload bridge and IPC implementations.
- Start and stop the service manager with the application lifecycle.
- Route renderer requests like `getServices`, `getGlobalEnv`, `startService`, `stopService`, and window controls.

### Preload Layer

Key files:

- `electron/app/preload/index.ts`
- `electron/app/preload/ipc.ts`

Responsibilities:

- Expose a controlled `window.ipc` API to the renderer.
- Expose a lightweight `window.api` event bridge for ad hoc message passing.
- Keep Electron APIs behind a preload boundary while still supporting renderer access to required desktop capabilities.

### Electron Build

Key files:

- `scripts/build.mjs`
- `electron/app/main/vite.config.ts`
- `electron/app/preload/vite.config.ts`

Build flow:

- Renderer is built with root `vite.config.ts`.
- Electron main and preload bundles are built separately with their own Vite configs.
- Electron Builder packages the final desktop app and includes selected service assets and runtimes.

## Service Platform Architecture

Primary locations:

- `electron/app/main/ServiceManager.ts`
- `electron/app/main/Service.ts`
- `electron/app/main/Services.ts`
- `services/*/service.json`

### Core Model

The service manager discovers service definitions by scanning `services/*/service.json`.

For each service it:

- Loads the config.
- Resolves platform-specific paths.
- Builds environment variables.
- Resolves and reserves ports.
- Sorts startup order using dependency and `serviceorder` rules.
- Runs install/setup steps when needed.
- Starts the service executable or delegated runtime.
- Applies health checks.
- Tracks process status, logs, and runtime metadata.

### Service Discovery and Startup

Each service definition can specify:

- `execservice`
  A runtime service such as Node, Python, or Java.
- `setup`
  Install/configuration commands.
- `setuparchive`
  Archive extraction details for bundled runtimes or binaries.
- `commandline`
  Start command.
- `healthcheck`
  HTTP, TCP, file, or variable-based readiness checks.
- `depend_on`
  Upstream services that must be available first.
- `globalenv`
  Environment variables published to the wider platform.

### Service Control Surfaces

There are two main ways services are exposed:

- Electron IPC
  Used by the renderer to fetch service state and issue lifecycle commands.
- Standalone service dashboard on port `30000`
  Implemented in `electron/app/main/Services.ts`, mainly useful for service inspection, logs, dependencies, and start/stop/setup operations.

## Service Categories

The service tree is broad. The easiest way to reason about it is by category.

### Runtime and Utility Services

These support other services:

- `_node`
- `_python`
- `_java`
- `_archive`
- `_localcert`

### Core Platform Services

These provide local infrastructure:

- `traefik`
- `nginx`
- `typedb`
- `mongo`
- `postgredb`
- `files`
- `openobserve`
- `filebeat`

### Application and Experience Services

These are closer to end-user functionality:

- `fastapi`
- `totaljs-flow`
- `totaljs-messageservice`
- `bpmn-server`
- `cms`
- `jupyterlab`
- `postgredb-admin`
- `keycloak`
- `soarca`
- `cacao-roaster`
- `typedb-init`
- `typedb-sample`

### Especially Important Services

- `fastapi`
  Appears to be the main backend API used by the renderer for datastore operations and generated algorithm/transformer/SVG workflows.
- `typedb`
  Primary graph/database engine used by default connection/query flows.
- `totaljs-flow`
  Workflow/flow engine used in embedded flow experiences and workflow pages.
- `totaljs-messageservice`
  Messaging/websocket support used by workflow and output flows.
- `traefik`
  Reverse proxy layer that gives the platform stable local HTTPS experience URLs.

## Data and Request Flows

### Renderer to Backend Flow

Typical save/load path:

1. User edits project/query/theme/connection state in the renderer.
2. Vuex module calls `src/utils/restapi.ts`.
3. Requests go to FastAPI on `http://localhost:8000`.
4. Backend persists or retrieves datastore records.
5. Vuex updates local state and UI.

### Renderer to Electron Flow

Typical local platform path:

1. Renderer calls `window.ipc.*`.
2. Preload forwards to Electron main process.
3. Electron main delegates to `ServiceManager`.
4. Results return to renderer via IPC promise or event.

### Service Environment Flow

Typical service bootstrap path:

1. Service manager loads service configs.
2. Services publish `globalenv` values.
3. Global environment values are merged and shared across services.
4. Renderer can request these values through Electron IPC.
5. Experience iframes and parts of the UI substitute `${ENV_VAR}` placeholders with resolved values.

## Project Workspace Model

The project workspace is organized around a tree and tab model.

Main entities:

- Project
- Connection
- Query
- Theme
- Wiring
- Output

Important behavior:

- Global and project-local variants coexist for queries, connections, and themes.
- Outputs can open in a split pane.
- Tree state and tab state are persisted.
- The project store also reacts to workflow-related websocket messages and can update project outputs dynamically.

## Embedded Experience Model

The repo includes an "experience" pattern for loading tools inside iframes.

Experience definitions primarily come from `settings.listOfMenu` in `src/data/default.json` and the `Settings` store module.

An experience typically includes:

- A route like `/experience/<id>`.
- A service dependency.
- A URL template, often using globally published variables.
- Optional iframe settings such as sandbox or referrer policy.

This is one of the key extensibility patterns in the repo.

## Development and Build Workflow

Common scripts from `package.json`:

- `npm run dev`
  Run the renderer only.
- `npm run services`
  Run the standalone service manager.
- `npm run electron:dev`
  Build Electron code, run renderer dev server, start services, then launch the desktop app.
- `npm run build`
  Type-check renderer and build renderer plus Electron bundles.
- `npm run app:build`
  Build the packaged desktop app.

## Testing

### Cypress

Location: `cypress/`

Current coverage is focused on UI navigation and menu behaviors, such as:

- app menu items
- sidebar interactions
- project tab menu options
- menu show/hide behavior

### Vitest

Location: `vitest/`

Vitest is present but appears lighter-weight than Cypress in current repo usage.

## Important Conventions

- Service definitions are config-driven and live in `services/*/service.json`.
- Much renderer state is persisted to `localStorage`.
- The repo uses PrimeVue for many UI building blocks.
- The renderer is largely Options API based.
- Global environment values are a first-class integration mechanism across services and embedded experiences.
- The service manager is a central integration point and should be treated as a core subsystem, not just support tooling.

## Practical Starting Points

If you need to change a specific area, start here:

- Renderer boot or route flow
  `src/main.ts`, `src/App.vue`, `src/router/index.ts`
- Project workspace
  `src/components/Project/`, `src/store/Modules/Projects.ts`
- Experience embedding
  `src/components/IframeComponent/index.vue`, `src/store/Modules/Settings.ts`
- Service UI and status
  `src/store/Modules/Services.ts`, `src/components/ServiceInstallation/`
- Electron app lifecycle
  `electron/app/main/index.ts`
- IPC bridge
  `electron/app/preload/index.ts`, `electron/app/preload/ipc.ts`
- Service discovery and lifecycle
  `electron/app/main/ServiceManager.ts`, `electron/app/main/Service.ts`
- FastAPI backend integration
  `services/fastapi/`

## Current Observations and Caveats

- The repo mixes mature subsystems with partially wired or commented-out features, especially around graph/algorithm/transformer views.
- Some generated and service-managed folders are expected to change during normal usage, so not every dirty file indicates a hand-authored code change.
- The architecture is powerful but distributed across config, renderer code, Electron IPC, and service definitions, so cross-layer changes should be traced carefully.
- FastAPI, TypeDB, Flow, and the service manager appear to be the most critical integration axis.

## Suggested Future Enhancements to This Document

- Add a diagram of startup flow and runtime communication paths.
- Add a per-service ownership matrix.
- Add a route-to-component map.
- Add a datastore entity map for project/query/connection/theme records.
- Add a troubleshooting section for common service startup failures.
