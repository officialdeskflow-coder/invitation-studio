@echo off
node engine\build\build.mjs --all
node engine\build\build-site.mjs
echo.
echo Done. Upload one folder from READY-TO-UPLOAD (see START-HERE.md).
pause
