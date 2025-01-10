const fs = require('fs').promises;
const path = require('path');
const Logger = require('./Logger');

class CommandHandler {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.commands = new Map();
        this.aliases = new Map();
        this.cooldowns = new Map();
    }

    async loadCommands(directory = 'Commands') {
        try {
            const baseDir = path.join(__dirname, '..', directory);
            await this.loadCommandsRecursive(baseDir);
            Logger.info(`Successfully loaded ${this.commands.size} commands`);
        } catch (error) {
            Logger.expection(`Failed to load commands: ${error.message}`);
        }
    }

    async loadCommandsRecursive(dir) {
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await this.loadCommandsRecursive(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    const command = require(fullPath);
                    if (this.validateCommand(command)) {
                        this.registerCommand(command);
                    }
                } catch (error) {
                    Logger.expection(`Error loading command ${item}: ${error.message}`);
                }
            }
        }
    }

    validateCommand(command) {
        const requiredProps = ['name', 'description', 'category', 'execute'];
        return requiredProps.every(prop => command.hasOwnProperty(prop));
    }

    registerCommand(command) {
        this.commands.set(command.name, command);
        
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name);
            });
        }

        if (this.config.GeneralSettings.ShowLoadCommands) {
            Logger.info(`Registered command: ${command.name}`);
        }
    }

    async handleCommand(message) {
        const prefix = this.config.BotSettings.Prefix;
        
        if (!message.content.startsWith(prefix)) return;
        if (message.author.bot) return;

        // Check permissions
        if (message.author.id !== this.config.GeneralSettings.OwnerID && 
            !this.config.BotSettings.BotAdmins.includes(message.author.id)) {
            return;
        }

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Get command from name or alias
        const command = this.commands.get(commandName) || 
                       this.commands.get(this.aliases.get(commandName));

        if (!command) return;

        // Check cooldown
        if (await this.checkCooldown(message, command)) return;

        try {
            await this.executeCommand(command, message, args);
        } catch (error) {
            Logger.expection(`Error executing command ${commandName}: ${error.message}`);
            message.channel.send('An error occurred while executing the command.');
        }
    }

    async checkCooldown(message, command) {
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Map());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                await message.reply(
                    `Please wait ${timeLeft.toFixed(1)} more seconds before using the \`${command.name}\` command.`
                );
                return true;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        return false;
    }

    async executeCommand(command, message, args) {
        try {
            await command.execute(message, args, this.client);
            
            if (this.config.GeneralSettings.EnableDelete) {
                try {
                    await message.delete();
                } catch (error) {
                    Logger.warning(`Failed to delete command message: ${error.message}`);
                }
            }
        } catch (error) {
            throw error;
        }
    }

    getCommands() {
        return this.commands;
    }

    getCommandsByCategory() {
        const categories = new Map();
        
        this.commands.forEach(command => {
            if (!categories.has(command.category)) {
                categories.set(command.category, []);
            }
            categories.get(command.category).push(command);
        });

        return categories;
    }
}

module.exports = CommandHandler;