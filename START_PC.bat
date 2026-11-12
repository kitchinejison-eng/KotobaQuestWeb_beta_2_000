@echo off
setlocal
cd /d "%~dp0"
title KotobaQuest PC - 3D Game Launcher
echo.
echo KotobaQuest PC - starting local game server...
echo Please keep this window open while playing.
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_PC_SERVER.ps1"
if errorlevel 1 (
  echo.
  echo Game server could not start. Check the message above.
  pause
)
endlocal
