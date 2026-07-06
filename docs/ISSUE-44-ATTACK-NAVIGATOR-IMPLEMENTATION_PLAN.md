# Issue 44: Attack Navigator Service Plan

## Objective

Add `Attack Navigator` as a new local service in TypeRefinery.

## Confirmed Upstream Facts

- Attack Navigator is a frontend web application.
- The runnable app lives in the upstream `nav-app/` directory.
- Upstream runtime requirement is Node `22`.
- Upstream app uses Angular CLI `19`.
- Upstream local dev start command is `ng serve`.
- Upstream production build command is `ng build --configuration production`.
- Upstream build output goes to `nav-app/dist/browser/`.
- Upstream runtime config is loaded from `nav-app/src/assets/config.json`.
- Upstream config supports iframe embedding.
- Upstream config key for custom context menu entries is currently `custom_context_menu_items`.
- Release `v5.3.0` exists, but there are no packaged release assets attached.

## Service Decision

Use Attack Navigator as a prebuilt static web service in this repo.

Do not treat it as:

- a backend service
- a binary/archive service
- a Docker-based service

Current implementation assumption:

- build the upstream Angular app once during packaging
- package only the built runtime needed by TypeRefinery
- serve the built static files with a lightweight local Node server
- package the service as split `7z` archives
- expose it through Traefik

This is being done to avoid heavy install-time dependency work on end-user machines.

## Do This

### 1. Create the service folder

Create:

- `services/attack-navigator/`

Put the upstream Attack Navigator source there.

Include the upstream `nav-app/` application.

Also create:

- `services/attack-navigator/.gitignore`
- `services/attack-navigator/build.package.ps1`
- `services/attack-navigator/runtime/server.js`

### 2. Add the service definition

Create:

- `services/attack-navigator/service.json`

The service config must define:

- `id`
- `name`
- `description`
- `enabled`
- `icon`
- `servicelocation`
- `execconfig`

`execconfig` must define:

- `execservice`
- `execcwd`
- `setup`
- `env`
- `globalenv`
- `commandline`
- `serviceport`
- `healthcheck`
- `depend_on`

### 3. Build once, run as static service

Do not run Attack Navigator in packaged TypeRefinery using Angular dev server.

Build the Angular app once during packaging, then run the built output using a lightweight local Node static server.

Use:

- build input: upstream `nav-app/`
- build output: `nav-app/dist/browser/`
- packaged runtime: static files plus a small local `server.js`
- runtime service: `node`
- startup command: run the local `server.js` on a fixed port
- healthcheck: HTTP `200`

This avoids:

- `npm install` on end-user machines
- Angular CLI as a runtime dependency
- Angular dev-server as the packaged service runtime

### 4. Assign a local port

Pick one fixed local port for Attack Navigator.

The service must:

- start on that port
- respond on that port
- pass healthcheck on that port

### 5. Add healthcheck

The healthcheck must:

- be HTTP based
- hit the running app
- expect `200`

### 6. Make sure the service manager can run it

When complete, the service must:

- be discovered automatically by the service manager
- appear in the service list
- start
- stop
- report healthy state

### 7. Add packaging process

Package the service using the bundled 7zip executable already in this repo:

- `services/_archive/win32/7za.exe`

The packaging process must:

- build the upstream app from source
- stage only the runtime files needed by the packaged service
- create split `7z` archives
- use `50m` split volume size

Archive format requirement:

- `attack-navigator.7z.001`
- `attack-navigator.7z.002`
- additional parts as required

### 8. Add Traefik exposure

This service must be exposed through Traefik.

Update:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

Add:

- a new global URL variable
- router entries
- load balancer service entry

Use the same local HTTPS host pattern as the other user-facing web services in this repo.

### 9. Do not add app entry in this task

Do not update:

- `src/data/default.json`

Reason:

- this task is only for adding the service to the local service platform
- app experience wiring is separate from base service onboarding
- keep the task limited to service packaging, startup, healthcheck, and proxy exposure

## Files To Change

Required:

- `services/attack-navigator/`
- `services/attack-navigator/service.json`
- `services/attack-navigator/.gitignore`
- `services/attack-navigator/build.package.ps1`
- `services/attack-navigator/runtime/server.js`

Likely:

- `services/_traefik/service.json`
- `services/_traefik/config/dynamic/dynamic.yml`

## Expected Output

Required output:

- new `attack-navigator` service folder
- working `service.json`
- local `.gitignore`
- packaging script
- static runtime server
- fixed service port
- working healthcheck
- split `7z` archive files using `50m` volumes

Likely output:

- stable HTTPS URL through Traefik

## Done When

The task is complete when all of these are true:

- the service folder exists
- `service.json` is valid
- the service is discovered by the service manager
- the service starts successfully
- the service passes healthcheck
- the service appears in the TypeRefinery service list
- the service is reachable through its HTTPS host
- the archive is produced as split `7z` volumes

## Do Not Include In This Task

Do not include:

- custom Attack Navigator right-click menu work
- import/transport API work
- ATT&CK object handling
- CMS workflow behavior
- any downstream feature integration
- app experience wiring
