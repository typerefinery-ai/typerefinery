# FastAPI Service Overview

The FastAPI service provides dynamically generated Python, JavaScript, and SVG artefacts that are written to a `generated` workspace. This document explains how that content is produced so you can trace or extend the behaviour safely.

## Runtime Paths

- The root for generated assets is `CONFIG.APP_USER_DATA_LOCATION`.
  - `SERVICE_DATA_PATH` environment variable or the `--user-dir` CLI flag override this location.
  - If neither is provided, the path defaults to the service directory itself.
- Child folders under `generated` are created on demand. Each request produces timestamped files plus `.log`, `.input`, and `.output` companions when applicable.

## Algorithm Pipeline (`POST /algorithm`)

- Accepts Python source plus newline-delimited dependency names.
- Builds a self-contained script in `generated/algorithm` by sandwiching the request body between template fragments from `template/algorithm`.
- Persists request metadata:
  - `${request}.py` combines header, body, and footer templates with the submitted code.
  - `.input`, `.output`, and `.log` files keep execution input, stdout, and trace output.
- Dependencies are installed lazily using the embedded interpreter (`pip install --user`).
- Execution uses the local Python runtime through `utils.UTILS.runScriptPython`.
- Retrieval endpoints expose the artefacts:
  - `GET /algorithm/{id}/script`, `/output`, `/log`, `/input`.

## SVG Composer (`POST /createSvg`)

- Writes SVGs to `generated/createsvg`.
- Templates from `template/createsvg` wrap the user supplied `code`.
- Optional `dependencies` URLs are inlined directly: each resource is downloaded, decoded, and wrapped with include markers before the main body is written.
- Returns either the finished SVG (`image/svg+xml`) or JSON metadata; logs are available at `GET /createSvg/{id}/log`.

## Transformer Runner (`POST /transformer`)

- Produces JavaScript scripts in `generated/transformer`.
- Combines request `code` with template scaffolding from `template/transformer`.
- Handles Node dependencies by invoking npm commands through the bundled Node distribution (`utils.UTILS.importOrInstallPackageNode`).
- Executes the script with the configured Node binary and captures stdout to a `.output` file.
- Artefacts are exposed via `GET /transformer/{id}/{script|output|log}`.

## Supporting Utilities

- `utils.py` orchestrates package installation and script execution for both Python and Node flows, providing consistent logging and error reporting through Loguru.
- `config.py` centralises runtime configuration, including path resolution and CORS settings.

## Operational Notes

- Ensure the `generated` directory is writable by the FastAPI process; failure to do so prevents artefact creation.
- On startup the service deletes `generated/algorithm/*.py` and `generated/algorithm/*.py.*` artefacts (submitted scripts plus related logs, inputs, and outputs) to keep the workspace from growing indefinitely. Move any files you need to preserve before restarting the API.
- Consider cleaning the other generated folders (`createsvg`, `transformer`) periodically if storage growth is a concern.
- Review `LOG_PATH` (`SERVICE_LOG_PATH` env var) to redirect per-request logs to a durable location if desired.
