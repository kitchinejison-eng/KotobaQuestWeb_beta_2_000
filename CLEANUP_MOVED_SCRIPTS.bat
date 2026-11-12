@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0CLEANUP_MOVED_SCRIPTS.ps1"
if errorlevel 1 echo Old files were retained when verification failed.
pause
