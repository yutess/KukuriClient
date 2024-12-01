const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Token = require("./Config/Token.json");

const client = new Client({
    checkUpdate: false
});

// Command Collection
client.commands = new Map();

function loadCommands() {
    const commandsPath = path.join(__dirname, 'Commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            client.commands.set(command.name, command);
            console.log(`Loaded command: ${command.name}`);
        } catch (error) {
            console.error(`Error loading command ${file}:`, error);
        }
    }
}

client.on('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
    loadCommands();
});

client.on('messageCreate', async (message) => {
    try {
        const settingsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'Config/Settings.json')));
        const prefix = settingsConfig.prefix || '.';

        if (!message.author.bot && message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.commands.get(commandName);
            if (command) {
                await command.execute(message, args, client);
            }
        }
    } catch (error) {
        console.error('Error handling command:', error);
    }
});

client.login(Token.token);