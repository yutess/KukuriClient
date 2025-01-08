const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'timeout',
    description: 'Timeout a user for a specified duration',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MODERATE_MEMBERS')) {
                return message.channel.send('You do not have permission to timeout members');
            }

            if (args.length < 2) {
                return message.channel.send('Usage: .timeout @user [duration] [reason]\nDuration format: 1m, 1h, 1d');
            }

            const targetUser = message.mentions.members.first();
            if (!targetUser) {
                return message.channel.send('Please mention a user to timeout');
            }

            if (!targetUser.moderatable) {
                return message.channel.send('I cannot timeout this user. They may have higher permissions');
            }

            // Parse duration
            const durationArg = args[1].toLowerCase();
            let duration = 0;

            if (durationArg.endsWith('m')) {
                duration = parseInt(durationArg) * 60 * 1000; // minutes to ms
            } else if (durationArg.endsWith('h')) {
                duration = parseInt(durationArg) * 60 * 60 * 1000; // hours to ms
            } else if (durationArg.endsWith('d')) {
                duration = parseInt(durationArg) * 24 * 60 * 60 * 1000; // days to ms
            } else {
                return message.channel.send('Invalid duration format. Use m (minutes), h (hours), or d (days)');
            }

            if (isNaN(duration) || duration < 0 || duration > 2419200000) { // Max 28 days
                return message.channel.send('Invalid duration. Must be between 1 minute and 28 days');
            }

            const reason = args.slice(2).join(' ') || 'No reason provided';

            await targetUser.timeout(duration, reason);

            const successEmbed = new WebEmbed()
                .setColor('GREEN')
                .setTitle('✅ User Timed Out')
                .setDescription(`Successfully timed out ${targetUser.user.username} for ${args[1]}\nReason: ${reason}`);

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${successEmbed}` });

        } catch (error) {
            Logger.expection(`Error executing timeout command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while trying to timeout the user');
        }
    }
};