@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\dev-server.ps1" stop
endlocal
