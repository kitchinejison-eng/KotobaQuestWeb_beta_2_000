@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CLEANUP_MOVED_IMAGES.ps1"
if errorlevel 1 (
  echo [INFO] Some old paths were left untouched; confirm moved images first.
) else (
  echo [OK] Old image files have been safely cleaned up.
)
pause
