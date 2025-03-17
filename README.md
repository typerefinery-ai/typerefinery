# TypeRefinery

[![build_status](https://github.com/typerefinery-ai/typerefinery/workflows/build-release/badge.svg)](https://github.com/typerefinery-ai/typerefinery/actions?workflow=Build/release)
[![TypeRefinery](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/8v1kna&style=flat-square&logo=cypress)](https://dashboard.cypress.io/projects/8v1kna/runs)
[![github license](https://img.shields.io/github/license/typerefinery-ai/typerefinery)](https://github.com/typerefinery-ai/typerefinery)
[![github issues](https://img.shields.io/github/issues/typerefinery-ai/typerefinery)](https://github.com/typerefinery-ai/typerefinery)
[![github last commit](https://img.shields.io/github/last-commit/typerefinery-ai/typerefinery)](https://github.com/typerefinery-ai/typerefinery)
[![github repo size](https://img.shields.io/github/repo-size/typerefinery-ai/typerefinery)](https://github.com/typerefinery-ai/typerefinery)
[![Gitter](https://badges.gitter.im/governance-foundation/community.svg)](https://gitter.im/governance-foundation/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Gitter](https://img.shields.io/badge/forum-Google-orange)](https://groups.google.com/forum/#!forum/governance-foundation)

## Overview

This template should help get you started developing `Electron` app using `Vue 3`, `Vite`, `Vuex` and `Vuetify`, and friends.

## Main Window

<img width="400px" src="https://raw.githubusercontent.com/typerefinery-ai/typerefinery/master/public/assets/electron-app.png" />

## Prerequisites

- Install powershell 7 (latest release)
- On Windows install Windows terminal (latest release)
- setup git for EOL to lf
- setup node 18.20.4 (latest release)

You can follow this guide to get you started [Setup Your Windows Devbox Like a Pro](https://aem.design/blog/2022/05/22/setup-your-windows-devbox-like-a-pro).

## Run Setup

```sh
# clone the project
git clone https://github.com/typerefinery-ai/typerefinery.git

# enter the project directory
cd typerefinery

# install dependency
npm install

# develop
npm run electron:dev
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

NOTE: this does not work yet, feel free to contribute.

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run build
npm run test:e2e # or `npm run test:e2e:ci` for headless testing
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Electron Dev

Run development server and electron UI.

```sh
npm run electron:dev
```

### Build Electron Dist

Compile installable Electron packages.

```sh
npm run app:build
```

### Add Githooks

```sh
npx simple-git-hooks
```

## Customize configuration

- See [Configuration Reference](https://cli.vuejs.org/config/).
- Mac category [LSApplicationCategoryType](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8)
- Update App Icons in `electron/assets` folder.
- Update App Details and build config in `package.json`.

## Pipelines

Following pipleines exist for compiling code as its commited

- Build Branche (build.yml) - Build and Test all branches and create releases.

## Releasing

When you want to create a new release, follow these steps:

1. Update the version in your project's package.json file (e.g. `2022.3.24`)
2. Commit and sign that change (`git commit -s -a -m "chore: release v2022.3.24"`)
3. Tag and sign your commit (`git tag -s -a v2022.3.24 -m "v2022.3.24"`). Make sure your tag name's format is `{YYYY}.{M}.{DD}`. Your workflow will use this tag to detect when to create a release
4. Push your changes to GitHub (git push && git push --tags)

### Cypress Reports

You can check cypress reports here https://dashboard.cypress.io/projects/8v1kna/runs

### Snapcraft

Install snapcraft, login and export login using

```
snapcraft export-login -
```
