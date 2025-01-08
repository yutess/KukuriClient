const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'lock',
    description: 'Lock or unlock a channel',
    category: 'Moderate',
    aliases: ['lockdown', 'unlock'],
    cooldown: 5,
    usage: '.lock [lock/unlock] [#channel]',
    permissions: ['MANAGE_CHANNELS'],
    execute: async (message, args, client) => {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MANAGE_CHANNELS')) {
                return message.channel.send('You do not have permission to manage channels');
            }

            const channel = message.mentions.channels.first() || message.channel;
            const action = args[0]?.toLowerCase();

            if (!['lock', 'unlock'].includes(action)) {
                return message.channel.send('Usage: .lock [lock/unlock] [#channel]\nIf no channel is specified, the current channel will be used.');
            }

            const everyoneRole = message.guild.roles.everyone;

            if (action === 'lock') {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });

                const embed = new WebEmbed()
                    .setColor('RED')
                    .setTitle('Channel Locked')
                    .setDescription(`${channel} has been locked`);

                message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
            } else {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SEND_MESSAGES: null,
                    ADD_REACTIONS: null
                });

                const embed = new WebEmbed()
                    .setColor('GREEN')
                    .setTitle('Channel Unlocked')
                    .setDescription(`${channel} has been unlocked`);

                message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
            }

        } catch (error) {
            Logger.expection(`Error executing lock command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing channel permissions');
        }
    }
};