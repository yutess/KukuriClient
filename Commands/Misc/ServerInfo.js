const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'serverinfo',
    description: 'Get information about the server',
    category: 'Misc',
    aliases: ['server', 'guild'],
    cooldown: 5,
    usage: '.serverinfo',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (!message.guild) return message.channel.send('❌ This command can only be used in a server.');
        try {
            // Collect server information
            const guild = message.guild;
            const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
            const channels = guild.channels.cache;
            const roles = guild.roles.cache;
            const emojis = guild.emojis.cache;
            const boosts = guild.premiumSubscriptionCount;
            const verificationLevel = {
                0: "None",
                1: "Low",
                2: "Medium",
                3: "High",
                4: "Very High"
            }[guild.verificationLevel];

            const serverEmbed = new WebEmbed()
                .setColor('#5865F2')
                .setTitle(`📊 Server Information for ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription([
                    `Server ID: ${guild.id}`,
                    `Owner: ${owner ? `${owner.user.tag} (<@${owner.id}>)` : 'Not found'}`,
                    `Members: ${guild.memberCount}`,
                    `Created: ${guild.createdAt.toLocaleDateString('en-US')}`,
                    `Channels: ${channels.size}`,
                    `Roles: ${roles.size}`,
                    `Emojis: ${emojis.size}`,
                    `Boosts: ${boosts || 0}`,
                    `Verification Level: ${verificationLevel}`,
                ].join('\n'));

            await message.channel.send({
                content: `${WebEmbed.hiddenEmbed}${serverEmbed}`
            });
        } catch (error) {
            console.error(error);
            message.channel.send('❌ An error occurred while fetching server information.');
        }
    },
};