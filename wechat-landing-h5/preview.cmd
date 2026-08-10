@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动满改平台 H5 预览...
node preview.cjs
pause
