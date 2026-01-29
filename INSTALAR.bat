@echo off
title Fênix System - Instalador
echo.
echo    ███████╗███████╗███╗   ██╗██╗██╗  ██╗
echo    ██╔════╝██╔════╝████╗  ██║██║╚██╗██╔╝
echo    █████╗  █████╗  ██╔██╗ ██║██║ ╚███╔╝ 
echo    ██╔══╝  ██╔══╝  ██║╚██╗██║██║ ██╔██╗ 
echo    ██║     ███████╗██║ ╚████║██║██╔╝ ██╗
echo    ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
echo.
echo ============================================
echo    SISTEMA PODE SER INSTALADO COMO APP!
echo ============================================
echo.
echo SE "INSTALAR" NÃO APARECER:
echo.
echo 1. Use Chrome ou Edge (recomendado)
echo 2. Abra: instalador-pwa.html
echo 3. Siga as instruções com imagens
echo.
echo Pressione:
echo [1] Para abrir sistema normal
echo [2] Para abrir guia de instalação
echo [3] Para testar instalação
echo.
set /p escolha="Sua escolha (1, 2 ou 3): "

if "%escolha%"=="1" goto normal
if "%escolha%"=="2" goto guia
if "%escolha%"=="3" goto testar

:normal
echo Abrindo sistema...
timeout /t 2 > nul
start index.html
exit

:guia
echo Abrindo guia de instalação...
timeout /t 2 > nul
start instalador-pwa.html
exit

:testar
echo Testando compatibilidade...
echo Set objShell = CreateObject("WScript.Shell") > test.vbs
echo objShell.Run "chrome.exe --app=http://localhost --user-data-dir=test_profile", 0 >> test.vbs
echo Set objFSO = CreateObject("Scripting.FileSystemObject") >> test.vbs
echo objFSO.DeleteFile "test.vbs" >> test.vbs
cscript //nologo test.vbs
echo Teste iniciado!
timeout /t 5 > nul
exit