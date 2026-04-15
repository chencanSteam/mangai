@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\dev-server.ps1" start
echo.
echo Project is available at http://127.0.0.1:8000/
endlocal
