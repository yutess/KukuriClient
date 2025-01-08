const { Client } = require('discord.js-selfbot-v13');
const path = require('path');
const fs = require('fs').promises;
const Config = require('./Config/Config.json');
const Logger = require('./Module/Logger');
const CommandHandler = require('./Module/CommandHandler');
const { version } = require('./package.json');

class KukuriClient {
    constructor() {
        this.client = new Client({
            checkUpdate: false
        });
        
        this.commandHandler = new CommandHandler(this.client, Config);
        this.client.commandHandler = this.commandHandler;
    }

    async initialize() {
        try {
            await this.setupConfig();
            await this.setupEventListeners();
            await this.commandHandler.loadCommands();
            await this.login();
        } catch (error) {
            Logger.error('Failed to initialize client:', error);
            process.exit(1);
        }
    }

    async setupConfig() {
        if (!Config.GeneralSettings.OwnerID || Config.GeneralSettings.OwnerID.trim() === '') {
            Config.GeneralSettings.OwnerID = this.client.user.id;
            await this.saveConfig();
        }
    }

    async setupEventListeners() {
        this.client.on('ready', () => this.handleReady());
        this.client.on('messageCreate', (message) => this.commandHandler.handleCommand(message));
        this.client.on('error', (error) => Logger.error('Client error:', error));
        this.client.on('warn', (warning) => Logger.warning('Client warning:', warning));
    }

    async handleReady() {
        Logger.info(`Logged in as ${this.client.user.tag}`);
        Logger.system(`--> Now using Kukuri Client v${version}`);
        
        // Initialize all commands that have onReady handlers
        for (const [, command] of this.commandHandler.getCommands()) {
            if (command.onReady) {
                try {
                    await command.onReady(this.client);
                } catch (error) {
                    Logger.error(`Failed to initialize command ${command.name}:`, error);
                }
            }
        }
    }

    async login() {
        try {
            await this.client.login(Config.BotSettings.Token);
        } catch (error) {
            Logger.error('Failed to login:', error);
            process.exit(1);
        }
    }

    async saveConfig() {
        try {
            const configPath = path.join(__dirname, 'Config', 'Config.json');
            await fs.writeFile(configPath, JSON.stringify(Config, null, 4));
        } catch (error) {
            Logger.error('Failed to save config:', error);
        }
    }
}

// Start the client
const client = new KukuriClient();
client.initialize().catch(error => {
    Logger.error('Failed to start client:', error);
    process.exit(1);
});