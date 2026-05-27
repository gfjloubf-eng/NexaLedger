# TODO - Electron hardening + preload safe bridge

## Step 1 — Inspect current Electron wiring (source of truth)
- [x] Read `electron/main.ts`
- [x] Read `electron/preload.ts`
- [x] Read `electron/tsconfig.json`
- [x] Read `package.json`
- [x] Read `release/builder-effective-config.yaml` / validate electron-builder coverage

## Step 2 — Implement required changes (approved scope)
- [x] Update `electron/main.ts` ONLY:

  - [ ] keep security posture:
    - [ ] contextIsolation: true
    - [ ] nodeIntegration: false
    - [ ] sandbox: true
    - [ ] autoHideMenuBar: true
  - [ ] add `preload: path.join(__dirname, 'preload.js')`
  - [ ] add persistent window state
  - [ ] add safe reload handling
  - [ ] add crash-safe relaunch behavior
  - [ ] add production-safe `loadFile` handling
  - [ ] add offline-safe startup behavior
  - [ ] add graceful window restore
  - [ ] add lifecycle protection:
    - [ ] render-process-gone
    - [ ] did-fail-load
    - [ ] unresponsive window handling
    - [ ] safe app recovery logging
  - [ ] prevent duplicate Electron windows
  - [ ] ensure the window is restored instead of creating duplicates

## Step 3 — Implement preload security bridge
- [ ] Update `electron/preload.ts` ONLY:
  - [ ] use `contextBridge`.
  - [ ] expose ONLY:
    - [ ] app version
    - [ ] platform
    - [ ] safe invoke/send wrappers
  - [ ] do NOT expose Node APIs directly.

## Step 4 — Packaging / electron-builder
- [ ] Update electron-builder config (via `release/builder-effective-config.yaml` and/or `package.json` if necessary):
  - [ ] Windows NSIS target
  - [ ] executable generation
  - [ ] ensure output goes to `release/`
  - [ ] ensure built preload/main JS are packaged

## Step 5 — Validation
- [ ] Run `npm run build`
- [ ] Run `npm run electron:dev`
- [ ] Run `npm run electron:build`
- [ ] Confirm output exists under `release/`

## Step 6 — Summarize
- [ ] List modified files
- [ ] Electron architecture notes
- [ ] Preload bridge/security notes
- [ ] Packaging behavior notes
- [ ] Desktop persistence continuity notes
- [ ] Offline continuity behavior notes
- [ ] Remaining desktop risks

