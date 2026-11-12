@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is required to run the checks.
  pause
  exit /b 1
)
node "tools\verify-script-paths.cjs"
if errorlevel 1 (pause & exit /b 1)
node "tools\verify-image-paths.cjs"
if errorlevel 1 (pause & exit /b 1)
echo [OK] All asset path checks passed.
pause
