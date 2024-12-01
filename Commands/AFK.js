const fs = require('fs');
const path = require('path');
const { WebhookClient } = require('discord.js-selfbot-v13');

let User = require("../Config/Client.json");
const Settings = require("../Config/Settings.json");

module.exports = {
    name: 'afk',
    description: 'Toggle AFK mode',
    execute(message, args, client) {
        const configPath = path.join(__dirname, '..', 'Config', 'Client.json');
        
        User.afk = !User.afk;

        fs.writeFileSync(configPath, JSON.stringify(User, null, 2));
        message.reply(`AFK mode has been ${User.afk ? 'enabled' : 'disabled'}.`);
    },
    init(client) {
        client.on('messageCreate', handle);
    }
};

async function handle(message) {
    User = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'Config', 'Client.json')));

    if (!User.afk) return;

    // Check if mention or DM
    if (message.channel.type === 'DM' || message.mentions.users.has(message.client.user.id)) {
        if (message.author.id === message.client.user.id) return; // Don't reply to self
        if (message.content.includes('@everyone') || message.content.includes('@here')) return; // Exclude everyone and here

        const randomKeyword = User.afkKeywords[Math.floor(Math.random() * User.afkKeywords.length)];
        await message.reply(`${randomKeyword}`);

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