const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const Logger = require('./Logger');

async function buildExecutable() {
    try {
        Logger.info('Starting build process...');

        const isWindows = process.platform === 'win32';
        
        // Create startup file content based on OS
        const Windows = `@echo off
echo Starting Kukuri Client...

REM Check for Bun
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo Starting with Bun...
    bun run start
) else (
    echo Bun is not installed! Please install Bun first.
    echo You can install it from: https://bun.sh
    pause
    exit /b 1
)

pause`;

        const Linux = `#!/bin/bash
echo "Starting Kukuri Client..."

# Check for Bun
if command -v bun >/dev/null 2>&1; then
    echo "Starting with Bun..."
    bun run start
else
    echo "Bun is not installed! Please install Bun first."
    echo "You can install it from: https://bun.sh"
    exit 1
fi`;

        const fileName = `KukuriClient${isWindows ? '.bat' : '.sh'}`;
        const content = isWindows ? Windows : Linux;
        
        const filePath = path.join(__dirname, '..', fileName);
        fs.writeFileSync(filePath, content);

        if (!isWindows) {
            fs.chmodSync(filePath, '755');
        }

        Logger.info('Build completed successfully!');
        Logger.info(`Launcher can be found in: ${filePath}`);
        Logger.info('Note: Make sure Bun is installed to run the client.');

    } catch (error) {
        Logger.expection('Build failed: ' + error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    buildExecutable();
}

module.exports = buildExecutable;
