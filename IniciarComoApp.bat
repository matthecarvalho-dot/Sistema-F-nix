@echo off
title Fênix System (Modo App)
echo Iniciando como aplicativo...

:: Verificar se Edge existe
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    echo Usando Microsoft Edge...
    start msedge.exe --app="file:///%cd%/index.html" --user-data-dir="%cd%/edge_profile"
) else (
    echo Edge não encontrado. Usando Chrome...
    start chrome.exe --app="file:///%cd%/index.html" --user-data-dir="%cd%/chrome_profile"
)

echo App iniciado! Esta janela pode ser fechada.
timeout /t 3 > nul
exit