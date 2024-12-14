const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Logger = require('../Module/Logger');

class ServerManager {
    constructor() {
        this.window = null;
        this.serverProcess = null;
    }

    createWindow() {
        try {
            this.window = new BrowserWindow({
                width: 400,
                height: 500,
                resizable: false,
                transparent: true,
                frame: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                }
            });

            this.window.loadFile(path.join(__dirname, 'renderer', 'index.html'));
            this.window.removeMenu();

        } catch (error) {
            Logger.expection('Create window error:', error.message);
            throw error;
        }
    }

    startServer() {
        try {
            const runtime = this.checkRuntime();
            Logger.info(`Using runtime: ${runtime}`);

            const serverPath = path.join(__dirname, '..', 'Server', 'app.js');
            Logger.info(`Starting server from: ${serverPath}`);

            this.serverProcess = spawn(runtime, [serverPath], {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            this.serverProcess.stdout.on('data', (data) => {
                Logger.info(`Server: ${data}`);
            });

            this.serverProcess.stderr.on('data', (data) => {
                Logger.expection(`Server error: ${data}`);
            });

            this.serverProcess.on('close', (code) => {
                Logger.info(`Server process exited with code ${code}`);
            });

        } catch (error) {
            Logger.expection('Failed to start server:', error);
        }
    }

    checkRuntime() {
        try {
            require('child_process').execSync('bun -v', { stdio: 'pipe' });
            return 'bun';
        } catch {
            return 'node';
        }
    }

    async start() {
        try {
            await app.whenReady();
            this.createWindow();
            this.startServer();

            app.on('window-all-closed', () => {
                if (this.serverProcess) {
                    this.serverProcess.kill();
                }
                if (process.platform !== 'darwin') {
                    app.quit();
                }
            });

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        } catch (error) {
            Logger.expection('Start application error:', error.message);
            throw error;
        }
    }
}

const manager = new ServerManager();
manager.start().catch(error => {
    Logger.expection('Start failed:', error.message);
    app.quit();
});