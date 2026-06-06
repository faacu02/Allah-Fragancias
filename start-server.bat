@echo off
cd /d %CD%
start /B pnpm dev > server.log 2>&1
