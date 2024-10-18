const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'serverinfo',
    description: 'Get information about the current server',
    execute(message, args, client) {
        if (!message.guild) return message.reply('This command can only be used in a server.');
        const serverEmbed = new WebEmbed()
            .setColor('BLUE')
            .setTitle(message.guild.name)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(`Server ID: ${message.guild.id}\nOwner: <@${message.guild.ownerId}>\nMembers: ${message.guild.memberCount}\nCreated At: ${message.guild.createdAt.toDateString()}`)
        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${serverEmbed}` });
    },
};