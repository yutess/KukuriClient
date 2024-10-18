const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'userinfo',
    description: 'Get information about a user',
    execute(message, args, client) {
        const mentionedUser = message.mentions.users.first() || message.author;
        const member = message.guild ? message.guild.members.cache.get(mentionedUser.id) : null;
        let userInfo = `User ID: ${mentionedUser.id}\nAccount Created: ${mentionedUser.createdAt.toDateString()}`;
        if (member) {
            userInfo += `\nJoined Server: ${member.joinedAt.toDateString()}\nRoles: ${member.roles.cache.map(role => role.name).join(', ')}`;
        }
        const userEmbed = new WebEmbed()
            .setColor('GREEN')
            .setTitle(mentionedUser.tag)
            .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }))
            .setDescription(userInfo)
        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${userEmbed}` });
    },
};