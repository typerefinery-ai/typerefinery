# Issue 53: NSA Ghidra Implementation Design

## Decision

Implement `NSA Ghidra` as a `utility service` plus a `Webswing` runtime service.

## What Must Be Done

- Add a `ghidra` utility service in `services/ghidra/`.
- Install Ghidra from the upstream release URL at service setup time using `archiveUrl`.
- Extract the archive locally.
- Resolve and emit `GHIDRA_INSTALL_DIR`.
- Run `buildNatives` from `support/gradle`.
- Generate a Webswing app registration for Ghidra.
- Add a `webswing` service in `services/webswing/`.
- Install Webswing from its upstream distribution URL at service setup time using `archiveUrl`.
- Merge the generated Ghidra registration into `webswing.config`.
- Start Webswing locally and expose the UI at `/ghidra`.

## Service Split

### `ghidra`

- Service type: `UTILITY`
- Purpose: install Ghidra, prepare native bits, emit environment values, generate registration payload
- Required output:
  - `GHIDRA_INSTALL_DIR`
  - `GHIDRA_JAVA_HOME`
  - `GHIDRA_JAVA_EXECUTABLE`
  - `services/webswing/config/registrations/ghidra.json`

### `webswing`

- Service type: normal local web service
- Purpose: host the browser UI for Ghidra
- Required output:
  - extracted Webswing runtime
  - merged `webswing.config`
  - running local UI on port `8080`

## Files

### Core

- `electron/app/main/Service.ts`

### Ghidra

- `services/ghidra/service.json`
- `services/ghidra/setup.ps1`
- `services/ghidra/start.ps1`
- `services/ghidra/build.package.ps1`
- `services/ghidra/.gitignore`
- `services/ghidra.ps1`

### Webswing

- `services/webswing/service.json`
- `services/webswing/configure.ps1`
- `services/webswing/run-webswing.bat`
- `services/webswing/start.ps1`
- `services/webswing/build.package.ps1`
- `services/webswing/config/webswing.base.json`
- `services/webswing/.gitignore`
- `services/webswing.ps1`

## Runtime Calls

### Ghidra archive

- `archiveUrl`
  - `https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_12.0.4_build/ghidra_12.0.4_PUBLIC_20260303.zip`

### Ghidra build step

- run from:
  - `<GhidraInstallDir>/support/gradle`
- command:
  - `gradle buildNatives`

### Webswing archive

- `archiveUrl`
  - `https://repo1.maven.org/maven2/org/webswing/webswing-assembly/20.2.3/webswing-assembly-20.2.3-distribution.zip`

## Webswing App Shape

- Path: `/ghidra`
- Name: `NSA Ghidra`
- Session mode: `CONTINUE_FOR_USER`
- Session stealing: `true`
- Session timeout: `3600`
- Launcher type: `Desktop`
- Main class: `ghidra.Ghidra`
- Args: `ghidra.GhidraRun`
- Class path:
  - `<GhidraInstallDir>/Ghidra/Framework/Utility/lib/Utility.jar`

## Done When

- Ghidra installs from `archiveUrl` during service setup.
- `GHIDRA_INSTALL_DIR` is emitted by the utility service.
- `buildNatives` is executed.
- Ghidra registration JSON is generated for Webswing.
- Webswing installs from `archiveUrl` during service setup.
- Webswing writes a merged `webswing.config`.
- Webswing starts locally on port `8080`.
- Ghidra is registered under `/ghidra`.
