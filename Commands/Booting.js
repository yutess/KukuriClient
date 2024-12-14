const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Logger = require('../Module/Logger');

module.exports = {
    name: 'boot',
    description: 'Set boot message channel and toggle boot status',
    async execute(message, args, client) {
        try {
            const configPath = path.join(__dirname, '..', 'Config', 'Boot.json');
            let bootConfig = {};

            if (fs.existsSync(configPath)) {
                bootConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            }

            if (!args.length) {
                return message.reply('Usage: .boot on [channelId] or .boot off');
            }

            const option = args[0].toLowerCase();

            if (option !== 'on' && option !== 'off') {
                return message.reply('Please specify either "on" or "off"');
            }

            if (option === 'on') {
                const channelId = args[1] || bootConfig.channelId;
                
                if (!channelId) {
                    return message.reply('Please provide a channel ID: .boot on [channelId]');
                }

                const channel = await client.channels.fetch(channelId).catch(() => null);
                if (!channel) {
                    return message.reply('Invalid channel ID. Please try again.');
                }

                bootConfig.channelId = channelId;
                bootConfig.enabled = true;
                message.reply(`Boot message enabled in channel: ${channel.name}`);
            } else {
                bootConfig.enabled = false;
                message.reply('Boot message disabled!');
            }

            fs.writeFileSync(configPath, JSON.stringify(bootConfig, null, 2));

        } catch (error) {
            Logger.expection(`Error in boot command: ${error.message}`);
            message.reply('An error occurred while setting up boot message.');
        }
    },
};