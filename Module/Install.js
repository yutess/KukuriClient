const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class Installer {
    constructor() {
        this.requiredDirs = ['Commands', 'Config', 'data', 'Logs'];
    }

    async createDirectories() {
        for (const dir of this.requiredDirs) {
            const dirPath = path.join(__dirname, '..', dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }
    }

    async installPackages() {
        try {
            execSync('bun install', {
                stdio: 'ignore',
                cwd: path.join(__dirname, '..')
            });
            return true;
        } catch (error) {
            Logger.expection(`Failed to install packages: ${error.message}`);
            return false;
        }
    }

    async createDefaultConfig() {
        const configPath = path.join(__dirname, '..', 'Config', 'Config.json');
        if (!fs.existsSync(configPath)) {
            const defaultConfig = {
                BotSettings: {
                    Token: "",
                    Prefix: ".",
                    BotAdmins: []
                },
                GeneralSettings: {
                    OwnerID: "",
                    ShowLoadCommands: false,
                    EnableNSFW: false
                },
                NotificationSettings: {
                    Enabled: false,
                    Webhook: ""
                }
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
        }
    }

    async start() {
        console.clear();
        Logger.info('Installing Kukuri Client...');

        try {
            await this.createDirectories();
            if (!await this.installPackages()) {
                return;
            }
            await this.createDefaultConfig();

            Logger.info('Installation completed!');
            Logger.info('Run "bun Module/Setup.js" to configure your bot');

        } catch (error) {
            Logger.expection(`Installation failed: ${error.message}`);
        }
    }
}

if (require.main === module) {
    const installer = new Installer();
    installer.start();
}

module.exports = Installer;