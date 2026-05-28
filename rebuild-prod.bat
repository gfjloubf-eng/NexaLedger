@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo NEXALEDGER — FULL PRODUCTION REBUILD
echo ==================================================
echo Target repo: NexaLedger-Final (this script must be run from repo root)

REM --- Safety: ensure we are in the expected repo root (best-effort)
if not exist package.json (
  echo [ERROR] package.json not found. Run this script from the NexaLedger-Final repo root.
  exit /b 1
)

echo.
echo [STEP 1/10] Removing old dependencies (node_modules)
if exist node_modules (
  rmdir /s /q node_modules
) else (
  echo node_modules does not exist; skipping.
)

echo.
echo [STEP 2/10] Optionally removing old lockfile (package-lock.json) if it exists
if exist package-lock.json (
  del /q package-lock.json
  echo package-lock.json removed.
) else (
  echo package-lock.json not found; skipping.
)

echo.
echo [STEP 3/10] Installing packages (npm install)
echo Note: using npm install (not npm ci) per requirements.
call npm install --no-fund --no-audit
if errorlevel 1 (
  echo [ERROR] npm install failed.
  exit /b 1
)


echo.
echo [STEP 4/10] Updating packages (npm update)
call npm update
if errorlevel 1 (
  echo [ERROR] npm update failed.
  exit /b 1
)

echo.
echo [STEP 5/10] Building Vite + Electron system (npm run build)
call npm run build
if errorlevel 1 (
  echo [ERROR] npm run build failed. Fix build errors before pushing.
  exit /b 1
)

echo.
echo [STEP 6/10] Verifying git working tree status
call git status

echo.
echo [STEP 7/10] Staging changes (git add .)
call git add .

echo.
echo [STEP 8/10] Committing production rebuild
REM Use --allow-empty just in case there are no changes after build artifacts.
call git commit --allow-empty -m "feat: NexaLedger final production rebuild and dependency refresh"
if errorlevel 1 (
  echo [ERROR] git commit failed.
  exit /b 1
)

echo.
echo [STEP 9/10] Pulling latest from origin/main with rebase (git pull origin main --rebase)
call git pull origin main --rebase
if errorlevel 1 (
  echo [ERROR] git pull --rebase failed.
  exit /b 1
)

echo.
echo [STEP 10/10] Pushing (force) to origin/main
call git push -f origin main
if errorlevel 1 (
  echo [ERROR] git push failed.
  exit /b 1
)

echo.
echo ==================================================
echo NexaLedger FINAL production system updated.
echo Dependencies refreshed successfully.
echo GitHub now contains the newest production build.
echo ==================================================

pause
endlocal

