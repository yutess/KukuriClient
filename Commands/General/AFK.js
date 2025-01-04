const fs = require('fs');
const path = require('path');
const { WebhookClient } = require('discord.js-selfbot-v13');

const Config = require("../../Config/Config.json");
const Settings = require("../../Config/Settings.json");

module.exports = {
    name: 'afk',
    description: 'Toggle AFK mode',
    category: 'General',
    execute(message, args, client) {
        const configPath = path.join(__dirname, '..', 'Config', 'Config.json');
        
        // Toggle AFK status
        Config.Commands.AFK.afk = !Config.Commands.AFK.afk;

        // Save updated config
        fs.writeFileSync(configPath, JSON.stringify(Config, null, 2));
        message.channel.send(`AFK mode has been ${Config.Commands.AFK.afk ? 'enabled' : 'disabled'}.`);
    },
    init(client) {
        client.on('messageCreate', handle);
    }
};

async function handle(message) {
    // Reload config on each message to get latest settings
    const Config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'Config', 'Config.json')));

    if (!Config.Commands.AFK.afk) return;

    // Check if mention or DM
    if (message.channel.type === 'DM' || message.mentions.users.has(message.client.user.id)) {
        if (message.author.id === message.client.user.id) return; // Don't reply to self
        if (message.content.includes('@everyone') || message.content.includes('@here')) return; // Exclude everyone and here

        // Get random AFK message from config
        const randomKeyword = Config.Commands.AFK.afkKeywords[
            Math.floor(Math.random() * Config.Commands.AFK.afkKeywords.length)
        ];
        
        await message.channel.send(`${randomKeyword}`);

        try {
            const webhookClient = new WebhookClient({ url: Settings.webhook });
            await webhookClient.send({
                content: `@everyone AFK Logs (Type: ${message.channel.type === 'DM' ? 'DM' : message.channel.name})\n\`\`\`\nUser: ${message.author.tag}\nMessage: ${message.content}\nResponse: ${randomKeyword}\`\`\``
            });
        } catch (error) {
            //Logger.expection('Failed to send webhook:', error);
        }
    }
}