const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Logger = require('./Logger');

class UpdateManager {
    constructor() {
        this.currentVersion = require('../package.json').version;
        this.githubRepo = 'Mikasuru/KukuriClient';
        this.tempDir = path.join(__dirname, '..', 'temp');
        this.backupDir = path.join(__dirname, '..', 'backup');
    }

    async checkForUpdates() {
        try {
            Logger.info('Checking for updates...');
            
            // Fetch latest release info from GitHub
            const response = await axios.get(`https://api.github.com/repos/${this.githubRepo}/releases/latest`);
            const latestVersion = response.data.tag_name.replace('v', '');

            if (latestVersion !== this.currentVersion) {
                Logger.info(`Update available! Current: ${this.currentVersion}, Latest: ${latestVersion}`);
                return {
                    hasUpdate: true,
                    currentVersion: this.currentVersion,
                    latestVersion: latestVersion,
                    downloadUrl: response.data.zipball_url
                };
            }

            Logger.info('No updates available.');
            return { hasUpdate: false };

        } catch (error) {
            Logger.expection(`Failed to check for updates: ${error.message}`);
            return { hasUpdate: false, error: error.message };
        }
    }

    async downloadUpdate(downloadUrl) {
        try {
            Logger.info('Downloading update...');

            // Create temp directory
            if (!fs.existsSync(this.tempDir)) {
                fs.mkdirSync(this.tempDir, { recursive: true });
            }

            // Download zip file
            const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const zipPath = path.join(this.tempDir, 'update.zip');
            fs.writeFileSync(zipPath, response.data);

            return zipPath;

        } catch (error) {
            Logger.expection(`Failed to download update: ${error.message}`);
            throw error;
        }
    }

    async createBackup() {
        try {
            Logger.info('Creating backup...');

            // Create backup directory with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
            
            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }

            // Copy all files except Update.js and temp/backup directories
            this.copyFilesRecursive(__dirname, backupPath, ['Update.js', 'temp', 'backup']);

            return backupPath;

        } catch (error) {
            Logger.expection(`Failed to create backup: ${error.message}`);
            throw error;
        }
    }

    async installUpdate(zipPath) {
        try {
            Logger.info('Installing update...');

            // Extract zip file using bun or npm's unzip
            if (this.hasBun()) {
                execSync(`bun x unzip -o "${zipPath}" -d "${this.tempDir}/extracted"`, { stdio: 'inherit' });
            } else {
                execSync(`npm exec --yes unzip -- -o "${zipPath}" -d "${this.tempDir}/extracted"`, { stdio: 'inherit' });
            }

            // Find extracted directory (it will be the only directory)
            const extractedDir = fs.readdirSync(path.join(this.tempDir, 'extracted'))
                .find(f => fs.statSync(path.join(this.tempDir, 'extracted', f)).isDirectory());

            const sourceDir = path.join(this.tempDir, 'extracted', extractedDir);
            const targetDir = path.join(__dirname, '..');

            // Copy new files, excluding Update.js
            this.copyFilesRecursive(sourceDir, targetDir, ['Update.js']);

            Logger.info('Update installed successfully!');

        } catch (error) {
            Logger.expection(`Failed to install update: ${error.message}`);
            throw error;
        } finally {
            // Cleanup
            this.cleanup();
        }
    }

    cleanup() {
        try {
            if (fs.existsSync(this.tempDir)) {
                fs.rmSync(this.tempDir, { recursive: true, force: true });
            }
        } catch (error) {
            Logger.warning(`Failed to cleanup: ${error.message}`);
        }
    }

    hasBun() {
        try {
            execSync('bun -v', { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    copyFilesRecursive(source, target, excludeList = []) {
        const entries = fs.readdirSync(source, { withFileTypes: true });

        for (const entry of entries) {
            if (excludeList.includes(entry.name)) continue;

            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);

            if (entry.isDirectory()) {
                if (!fs.existsSync(targetPath)) {
                    fs.mkdirSync(targetPath, { recursive: true });
                }
                this.copyFilesRecursive(sourcePath, targetPath, excludeList);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }
}

// Run update check if called directly
if (require.main === module) {
    (async () => {
        const updater = new UpdateManager();
        
        try {
            const updateInfo = await updater.checkForUpdates();
            
            if (updateInfo.hasUpdate) {
                const proceed = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                proceed.question(`Update available (${updateInfo.currentVersion} -> ${updateInfo.latestVersion}). Proceed? (y/n): `, async (answer) => {
                    if (answer.toLowerCase() === 'y') {
                        try {
                            const backupPath = await updater.createBackup();
                            Logger.info(`Backup created at: ${backupPath}`);

                            const zipPath = await updater.downloadUpdate(updateInfo.downloadUrl);
                            await updater.installUpdate(zipPath);

                            Logger.info('Update completed successfully!');
                            Logger.info('Please restart the client to apply updates.');
                        } catch (error) {
                            Logger.expection('Update failed. Original files are preserved in backup directory.');
                        }
                    }
                    proceed.close();
                });
            }
        } catch (error) {
            Logger.expection('Update process failed.');
            process.exit(1);
        }
    })();
}

module.exports = UpdateManager;