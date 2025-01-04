const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Config = require("./Config/Config.json");
const scheduleCommand = require('./Commands/Misc/Schedule');

const client = new Client({
    checkUpdate: false
});

client.commands = new Map();

function loadCommands(dir = 'Commands') {
    const commandsPath = path.join(__dirname, dir);
    const items = fs.readdirSync(commandsPath);
    let loadedCount = 0;

    for (const item of items) {
        const itemPath = path.join(commandsPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Recursively load commands from subdirectories
            loadedCount += loadCommands(path.join(dir, item));
        } else if (item.endsWith('.js')) {
            try {
                const command = require(itemPath);
                client.commands.set(command.name, command);
                if (Config.GeneralSettings.ShowLoadCommands == true) {
                    console.log(`✅: ${command.name}`);
                }
                loadedCount++;
            } catch (error) {
                console.error(`❌: ('${item}') - `, error.message);
            }
        }
    }
    
    if (dir === 'Commands') {
        console.log(`Loaded ${loadedCount} commands`);
    }
    return loadedCount;
}

function ConfigOwnerID(userID) {
    Config.GeneralSettings.OwnerID = userID; // update OwnerID in memory
    
    const configPath = path.join(__dirname, 'Config', 'Config.json');
    fs.writeFileSync(configPath, JSON.stringify(Config, null, 4), 'utf8');
    console.log(`Updated OwnerID to: ${userID}`);
}

client.on('ready', async () => {
    if (!Config.GeneralSettings.OwnerID || Config.GeneralSettings.OwnerID.trim() === '') {
        ConfigOwnerID(client.user.id);
    }
    
    loadCommands();
    console.log(`Logged as ${client.user.tag}`);
    scheduleCommand.initialize(client);
    for (const command of client.commands.values()) {
        if (command.onReady) {
            await command.onReady(client);
        }
    }
    // TODO: Make a startup message if bot starting up
});

client.on('messageCreate', async (message) => {
    const configPath = './Config/Config.json';
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    try {
        const prefix = Config.BotSettings.Prefix || '.';
        if (message.author.id !== Config.GeneralSettings.OwnerID && !Config.BotSettings.BotAdmins.includes(message.author.id)) {
            return; // return if not an owner or admin
        } 
        if (!message.author.bot && message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.commands.get(commandName);
            if (command) {
                await command.execute(message, args, client);
                if (Config.GeneralSettings.EnableDelete) {
                    try {
                        await message.delete();
                    } catch (deleteError) {
                        console.error('Error deleting message:', deleteError);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error handling command:', error);
    }
});

client.login(Config.BotSettings.Token);