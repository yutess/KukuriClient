const { WebEmbed } = require('discord.js-selfbot-v13');
const notifier = require('node-notifier');

module.exports = {
    name: 'purge',
    description: 'Purge a message',
    async execute(message, args, client) {

        for (let i = 0; i < 50; i++) {
            await message.channel.send("** **");
        }

        notifier.notify({
            title: 'Kukuri Client',
            message: `Purge completed`,
            sound: true,
            wait: false
        });
    },
};