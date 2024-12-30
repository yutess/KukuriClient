const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Logger = require('../Module/Logger');
const Config = require('../Config/Config.json');

module.exports = {
    name: 'boot',
    description: 'Set boot message channel and toggle boot status',
    async execute(message, args, client) {
        try {
            if (!args.length) {
                return message.reply('Usage: .boot on [channelId] or .boot off');
            }

            const configPath = path.join(__dirname, '..', 'Config', 'Config.json');
            const option = args[0].toLowerCase();

            if (option !== 'on' && option !== 'off') {
                return message.reply('Please specify either "on" or "off"');
            }

            if (option === 'on') {
                const channelId = args[1] || Config.Commands.Booting.ChannelID;
                
                if (!channelId) {
                    return message.reply('Please provide a channel ID: .boot on [channelId]');
                }

                const channel = await client.channels.fetch(channelId).catch(() => null);
                if (!channel) {
                    return message.reply('Invalid channel ID. Please try again.');
                }

                // Update Config object
                Config.Commands.Booting.ChannelID = channelId;
                Config.Commands.Booting.Enabled = true;
                message.reply(`Boot message enabled in channel: ${channel.name}`);
            } else {
                // Update Config object
                Config.Commands.Booting.Enabled = false;
                message.reply('Boot message disabled!');
            }

            // Save updated config
            fs.writeFileSync(configPath, JSON.stringify(Config, null, 2));

        } catch (error) {
            Logger.expection(`Error in boot command: ${error.message}`);
            message.reply('An error occurred while setting up boot message.');
        }
    },
};