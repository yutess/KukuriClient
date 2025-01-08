const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'slowmode',
    description: 'Set channel slowmode duration',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MANAGE_CHANNELS')) {
                return message.channel.send('You do not have permission to manage channels');
            }

            if (!args[0]) {
                return message.channel.send('Usage: .slowmode [duration] [#channel]\nDuration in seconds, or 0 to disable\nExample: .slowmode 10');
            }

            const duration = parseInt(args[0]);
            if (isNaN(duration) || duration < 0 || duration > 21600) {
                return message.channel.send('Please provide a valid duration between 0 and 21600 seconds (6 hours)');
            }

            const channel = message.mentions.channels.first() || message.channel;

            await channel.setRateLimitPerUser(duration);

            const embed = new WebEmbed()
                .setColor(duration === 0 ? 'GREEN' : 'YELLOW')
                .setTitle('Slowmode Updated')
                .setDescription(
                    duration === 0
                        ? `Slowmode has been disabled in ${channel}`
                        : `Slowmode has been set to ${duration} seconds in ${channel}`
                );

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });

        } catch (error) {
            Logger.expection(`Error executing slowmode command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while setting slowmode');
        }
    }
};