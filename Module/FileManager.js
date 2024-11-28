const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync, spawn } = require('child_process');
const Logger = require('./Logger');

class FileManager {
    constructor() {
        this.baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'
        };
        this.githubRepo = 'https://raw.githubusercontent.com/Mikasuru/KukuriClient/main/';
    }

    // Check if using Bun or NPM
    checkRuntime() {
        try {
            execSync('bun -v', { stdio: 'pipe' });
            return 'bun';
        } catch {
            try {
                execSync('npm -v', { stdio: 'pipe' });
                return 'npm';
            } catch {
                throw new Error('Neither Bun nor NPM found in system');
            }
        }
    }

    // Install dependencies based on runtime
    async installDependencies() {
        const runtime = this.checkRuntime();
        Logger.info(`Using ${runtime} as package manager`);
        
        try {
            if (runtime === 'bun') {
                execSync('bun install', { stdio: 'inherit' });
            } else {
                execSync('npm install', { stdio: 'inherit' });
            }
            Logger.load('Dependencies installed successfully');
        } catch (error) {
            Logger.expection(`Failed to install dependencies: ${error.message}`);
            throw error;
        }
    }

    // Download a file from GitHub
    async downloadFile(filePath) {
        const url = this.githubRepo + filePath;
        const localPath = path.join(process.cwd(), filePath);

        try {
            const response = await axios.get(url, {
                headers: this.baseHeaders
            });

            // Create directories if they don't exist
            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, response.data);
            Logger.load(`Downloaded ${filePath}`);
            return true;
        } catch (error) {
            Logger.expection(`Failed to download ${filePath}: ${error.message}`);
            return false;
        }
    }

    // Check and download missing files
    async checkMissingFiles() {
        Logger.load('Checking for missing files...');

        const requiredFiles = [
            'Commands/AFK.js',
            'Commands/Avatar.js',
            'Commands/Calculate.js',
            'Commands/Clean.js',
            'Commands/FakeYoutube.js',
            'Commands/Help.js',
            'Commands/Ping.js',
            'Commands/Poll.js',
            'Commands/Purge.js',
            'Commands/RPC.js',
            'Commands/SampleEmbed.js',
            'Commands/ServerInfo.js',
            'Commands/UserInfo.js',
            'Commands/VoiceMessage.js',
            'Module/Logger.js',
            'Module/Manager.js',
            'Server/app.js',
            'Server/public/index.html',
            'Server/public/css/modal.css',
            'Server/public/css/style.css',
            'Server/public/js/commands.js',
            'Server/public/js/main.js',
            'Server/public/js/messages.js',
            'Server/public/js/settings.js',
            'Server/public/js/websocket.js',
            'Main.js'
        ];

        for (const file of requiredFiles) {
            const localPath = path.join(process.cwd(), file);
            if (!fs.existsSync(localPath)) {
                Logger.warning(`Missing ${file}, downloading...`);
                await this.downloadFile(file);
            }
        }
        
        Logger.load('File check complete');
    }
}

module.exports = {
    FileManager
};