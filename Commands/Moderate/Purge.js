const { WebEmbed } = require('discord.js-selfbot-v13');
const notifier = require('node-notifier');

module.exports = {
    name: 'purge',
    description: 'Purge a specific number of messages',
    category: 'Moderate',
    aliases: ['prune', 'bulk'],
    cooldown: 5,
    usage: '.purge [amount]\nExample: .purge 50',
    permissions: ['MANAGE_MESSAGES'],
    execute: async (message, args, client) => {
        if (!args[0] || isNaN(args[0])) {
            return message.channel.send('Please provide a valid number of messages to purge.');
        }

        const messageCount = parseInt(args[0], 10);

        if (messageCount < 1 || messageCount > 100) {
            return message.channel.send('Please provide a number between 1 and 100.');
        }

        for (let i = 0; i < messageCount; i++) {
            await message.channel.send("** **");
        }

        notifier.notify({
            title: 'Kukuri Client',
            message: `Purge completed. Sent ${messageCount} messages.`,
            sound: true,
            wait: false
        });

    },
};
