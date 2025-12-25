@echo off
setlocal
title Discord Bot Dashboard
:a
cls
echo ======================================================
echo          DISCORD BOT YENIDEN BASLATILIYOR             
echo ======================================================
echo [%date% %time%] Bot calistiriliyor...
node --no-warnings ./src/Server.js
echo.
echo [!] Bot kapandi/coktu. 5 saniye icinde yeniden baslatilacak...
timeout /t 5
goto a