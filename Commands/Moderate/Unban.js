const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'unban',
    description: 'Unban a user from the server',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            const member = message.guild.members.cache.get(client.user.id);
            if (!member.permissions.has('BAN_MEMBERS')) {
                return message.channel.send('Bot does not have permission to unban members');
            }

            if (!args[0]) {
                return message.channel.send('Please provide a user ID to unban\nExample: .unban [userID]');
            }

            try {
                await message.guild.bans.fetch(args[0]);
            } catch {
                return message.channel.send('This user is not banned or the ID is invalid');
            }

            await message.guild.members.unban(args[0]);

            const successEmbed = new WebEmbed()
                .setColor('GREEN')
                .setTitle('✅ User Unbanned')
                .setDescription(`Successfully unbanned user with ID: ${args[0]}`);

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${successEmbed}` });

        } catch (error) {
            Logger.expection(`Error executing unban command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while trying to unban the user');
        }
    }
};