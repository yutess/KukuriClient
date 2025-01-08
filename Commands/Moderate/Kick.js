const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server',
    category: 'Moderate',
    aliases: ['kickuser'],
    cooldown: 5,
    usage: '.kick <@user/id> [reason]',
    permissions: ['KICK_MEMBERS'],
    execute: async (message, args, client) => {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            const member = message.guild.members.cache.get(client.user.id);
            if (!member.permissions.has('KICK_MEMBERS')) {
                return message.channel.send('Bot does not have permission to kick members');
            }

            let targetUser;
            if (message.mentions.members.first()) {
                targetUser = message.mentions.members.first();
            } else if (args[0]) {
                targetUser = await message.guild.members.fetch(args[0]).catch(() => null);
            }

            if (!targetUser) {
                return message.channel.send('Please mention a user or provide a user ID to kick\nExample: .kick @user or .kick [userID]');
            }

            if (!targetUser.kickable) {
                return message.channel.send('Unable to kick this user. They may have higher permissions');
            }

            await targetUser.kick();

            const successEmbed = new WebEmbed()
                .setColor('GREEN')
                .setTitle('✅ User Kicked')
                .setDescription(`Successfully kicked ${targetUser.user.username}`);

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${successEmbed}` });

        } catch (error) {
            Logger.expection(`Error executing kick command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while trying to kick the user');
        }
    }
};