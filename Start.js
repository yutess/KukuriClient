const Logger = require('./Module/Logger');
const { execSync, spawn } = require('child_process');
const path = require('path');

function checkRuntime() {
    try {
        execSync('bun -v', { stdio: 'pipe' });
        return 'bun';
    } catch {
        try {
            execSync('npm -v', { stdio: 'pipe' });
            return 'npm';
        } catch {
            Logger.expection('Neither Bun nor NPM found in system');
            process.exit(1); // Exit process if no runtime is found
        }
    }
}

const runtime = checkRuntime();
const command = runtime === 'bun' ? 'bun' : 'node';

const child = spawn(command, [path.join('Server', 'app.js')], {
    stdio: 'inherit',
});

child.on('close', (code) => {
    if (code === 0) {
        Logger.info('Server process exited successfully.');
    } else {
        Logger.expection(`Server process exited with code ${code}`);
    }
});

Logger.load('Server started successfully, waiting for termination...');
