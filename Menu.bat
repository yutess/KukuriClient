@echo off
chcp 65001 > nul
cls

:menu
echo.
echo ╔════════════════════════════════════╗
echo ║        Kukuri Client Manager       ║
echo ╠════════════════════════════════════╣
echo ║ [1] Check/Install Bun              ║
echo ║ [2] Start Main.js                  ║
echo ║ [3] Start Server/app.js            ║
echo ║ [4] Build Application              ║
echo ║ [5] Exit                           ║
echo ╚════════════════════════════════════╝
echo.
choice /c 12345 /n /m "Choose option (1-5): "

if errorlevel 5 goto end
if errorlevel 4 goto build
if errorlevel 3 goto server
if errorlevel 2 goto main
if errorlevel 1 goto checkbun

:checkbun
cls
echo Checking for Bun installation...
bun -v > nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Bun is already installed!
) else (
    echo [!] Bun not found. Installing...
    curl -fsSL https://bun.sh/install | powershell
    if %errorlevel% equ 0 (
        echo [✓] Bun installed successfully!
    ) else (
        echo [×] Failed to install Bun
    )
)
pause
goto menu

:main
cls
echo Starting Main.js...
echo.
bun electron Application/Main.js
if %errorlevel% equ 0 (
    echo [✓] Main.js started successfully!
) else (
    echo [×] Failed to start Main.js
)
pause
goto menu

:server
cls
echo Starting Server/app.js...
echo.
bun Server/app.js
if %errorlevel% equ 0 (
    echo [✓] Server started successfully!
) else (
    echo [×] Failed to start server
)
pause
goto menu

:build1
cls
echo Building Application...
echo.
call bun install
if %errorlevel% equ 0 (
    echo [✓] Dependencies installed
    call bun run build
    if %errorlevel% equ 0 (
        echo [✓] Application built successfully!
        echo [i] Check the 'dist' folder for the installer
    ) else (
        echo [×] Build failed
    )
) else (
    echo [×] Failed to install dependencies
)
pause
goto menu

:build
cls
echo Disabled for now...
pause
goto menu

:end
exit