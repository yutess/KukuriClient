const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Config = require("./Config/Config.json");

const client = new Client({
    checkUpdate: false
});

client.commands = new Map();

function loadCommands() {
    const commandsPath = path.join(__dirname, 'Commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    let loadedCount = 0;

    console.log('Loading commands...');
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            client.commands.set(command.name, command);
            if (Config.GeneralSettings.ShowLoadCommands == true) {
                console.log(`✅: ${command.name}`);
            }
            loadedCount++;
        } catch (error) {
            console.error(`❌: ('${file}') - `, error.message);
        }
    }
    console.log(`${loadedCount} Command(s) loaded successfully.`);
}

client.on('ready', () => {
    loadCommands();
    console.log(`Logged as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    try {
        const prefix = Config.BotSettings.Prefix || '.';

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

client.login(Config.BotSettings.Token);
