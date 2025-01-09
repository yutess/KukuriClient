const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Config = require("./Config/Config.json");
const Logger = require('./Module/Logger');

class ClientManager {
    constructor() {
        this.client = new Client({
            checkUpdate: false
        });
        this.commands = new Map();
    }

    async initialize() {
        try {
            await this.loadCommands();
            await this.setupConfig();
            await this.setupEventListeners();
            await this.login();
        } catch (error) {
            Logger.expection(`Failed to initialize: ${error.message}`);
        }
    }

    async setupConfig() {
        try {
            this.client.on('ready', () => {
                if (!Config.GeneralSettings.OwnerID || Config.GeneralSettings.OwnerID.trim() === '') {
                    Config.GeneralSettings.OwnerID = this.client.user.id;
                    
                    const configPath = path.join(__dirname, 'Config', 'Config.json');
                    fs.writeFileSync(configPath, JSON.stringify(Config, null, 4), 'utf8');
                    Logger.info(`Updated OwnerID to: ${this.client.user.id}`);
                }
            });
        } catch (error) {
            Logger.expection(`Failed to setup config: ${error.message}`);
        }
    }

    async loadCommands(dir = 'Commands') {
        const commandsPath = path.join(__dirname, dir);
        const items = fs.readdirSync(commandsPath);
        let loadedCount = 0;

        for (const item of items) {
            const itemPath = path.join(commandsPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                loadedCount += await this.loadCommands(path.join(dir, item));
            } else if (item.endsWith('.js')) {
                try {
                    const command = require(itemPath);
                    this.commands.set(command.name, command);
                    if (Config.GeneralSettings.ShowLoadCommands) {
                        Logger.info(`Loaded command: ${command.name}`);
                    }
                    loadedCount++;
                } catch (error) {
                    Logger.expection(`Failed to load command '${item}': ${error.message}`);
                }
            }
        }

        if (dir === 'Commands') {
            Logger.info(`Successfully loaded ${loadedCount} commands`);
        }
        return loadedCount;
    }

    async setupEventListeners() {
        this.client.on('ready', () => this.handleReady());
        this.client.on('messageCreate', (message) => this.handleMessage(message));
        this.client.on('error', (error) => Logger.expection(`Client error: ${error.message}`));
    }

    handleReady() {
        Logger.info(`Logged in as ${this.client.user.tag}.`);
    }

    async handleMessage(message) {
        if (!message.content.startsWith(Config.BotSettings.Prefix)) return;

        const args = message.content.slice(Config.BotSettings.Prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = this.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args, this.client);
        } catch (error) {
            Logger.expection(`Error executing command ${commandName}: ${error.message}`);
            message.channel.send('An error occurred while executing the command.');
        }
    }

    async login() {
        try {
            await this.client.login(Config.BotSettings.Token);
        } catch (error) {
            Logger.expection(`Failed to login: ${error.message}`);
        }
    }
}

const manager = new ClientManager();
manager.initialize();