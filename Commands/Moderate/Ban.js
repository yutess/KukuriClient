const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'ban',
    description: 'Ban a user from the server',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            const member = message.guild.members.cache.get(client.user.id);
            if (!member.permissions.has('BAN_MEMBERS')) {
                return message.channel.send('Bot does not have permission to ban members');
            }

            let targetUser;
            if (message.mentions.members.first()) {
                targetUser = message.mentions.members.first();
            } else if (args[0]) {
                try {
                    targetUser = await message.guild.members.fetch(args[0]);
                } catch {
                    await message.guild.members.ban(args[0]);
                    const successEmbed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('✅ User Banned')
                        .setDescription(`Successfully banned user with ID: ${args[0]}`);

                    return message.channel.send({ content: `${WebEmbed.hiddenEmbed}${successEmbed}` });
                }
            }

            if (!targetUser && !args[0]) {
                return message.channel.send('Please mention a user or provide a user ID to ban\nExample: .ban @user or .ban [userID]');
            }

            if (targetUser && !targetUser.bannable) {
                return message.channel.send('Unable to ban this user. They may have higher permissions');
            }

            if (targetUser) {
                await targetUser.ban();
                const successEmbed = new WebEmbed()
                    .setColor('GREEN')
                    .setTitle('✅ User Banned')
                    .setDescription(`Successfully banned ${targetUser.user.username}`);

                message.channel.send({ content: `${WebEmbed.hiddenEmbed}${successEmbed}` });
            }

        } catch (error) {
            Logger.expection(`Error executing ban command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while trying to ban the user');
        }
    }
};