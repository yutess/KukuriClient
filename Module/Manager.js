const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class ConfigManager {
    constructor() {
        this.configPath = path.join(process.cwd(), 'Config');
        this.configFiles = {
            settings: path.join(this.configPath, 'Settings.json'),
            token: path.join(this.configPath, 'Token.json'),
            client: path.join(this.configPath, 'Client.json')
        };
        
        // Create Config directory if it doesn't exist
        if (!fs.existsSync(this.configPath)) {
            fs.mkdirSync(this.configPath);
        }
    }

    getDefaultConfigs() {
        return {
            settings: {
                notification: false,
                prefix: '.',
                webhook: ''
            },
            token: {
                token: ''
            },
            client: {
                afk: false,
                afkKeywords: [
                    "What's up? I'm afk, Will be back soon!",
                    "This is an auto message, I'm currently afk.",
                    "Wait a min, I'm afk",
                    "What, wait a sec",
                    "yo wait I'm afk dude",
                    "this is an auto msg, I'm afk",
                    "afk"
                ]
            }
        };
    }

    loadConfig(type) {
        try {
            if (!this.configFiles[type]) {
                throw new Error(`Unknown config type: ${type}`);
            }

            if (!fs.existsSync(this.configFiles[type])) {
                Logger.info(`${type} config not found, creating with default values...`);
                this.saveConfig(type, this.getDefaultConfigs()[type]);
                return this.getDefaultConfigs()[type];
            }

            const config = JSON.parse(fs.readFileSync(this.configFiles[type], 'utf8'));
            return config;
        } catch (error) {
            Logger.expection(`Failed to load ${type} config: ${error.message}`);
            return null;
        }
    }

    saveConfig(type, data) {
        try {
            if (!this.configFiles[type]) {
                throw new Error(`Unknown config type: ${type}`);
            }

            fs.writeFileSync(this.configFiles[type], JSON.stringify(data, null, 2));
            Logger.load(`Saved ${type} config successfully`);
            return true;
        } catch (error) {
            Logger.expection(`Failed to save ${type} config: ${error.message}`);
            return false;
        }
    }

    updateConfig(type, updates) {
        try {
            const currentConfig = this.loadConfig(type);
            if (!currentConfig) {
                throw new Error(`Failed to load current ${type} config`);
            }

            const updatedConfig = { ...currentConfig, ...updates };
            return this.saveConfig(type, updatedConfig);
        } catch (error) {
            Logger.expection(`Failed to update ${type} config: ${error.message}`);
            return false;
        }
    }

    validateConfigs() {
        try {
            const requiredConfigs = ['settings', 'token', 'client'];
            const missingConfigs = [];

            for (const type of requiredConfigs) {
                const config = this.loadConfig(type);
                if (!config) {
                    missingConfigs.push(type);
                }
            }

            if (missingConfigs.length > 0) {
                Logger.warning(`Missing config files: ${missingConfigs.join(', ')}`);
                return false;
            }

            Logger.load('All config files are valid');
            return true;
        } catch (error) {
            Logger.expection(`Config validation failed: ${error.message}`);
            return false;
        }
    }

    resetConfig(type) {
        try {
            if (!this.configFiles[type]) {
                throw new Error(`Unknown config type: ${type}`);
            }

            const defaultConfig = this.getDefaultConfigs()[type];
            return this.saveConfig(type, defaultConfig);
        } catch (error) {
            Logger.expection(`Failed to reset ${type} config: ${error.message}`);
            return false;
        }
    }
}

module.exports = {
    ConfigManager
};