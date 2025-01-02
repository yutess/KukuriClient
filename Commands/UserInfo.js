const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'userinfo',
    description: 'Get information about a user',
    async execute(message, args, client) {
        try {
            const mentionedUser = message.mentions.users.first() || message.author;
            const member = message.guild ? message.guild.members.cache.get(mentionedUser.id) : null;
            
            if (mentionedUser) {
                let userInfo = [
                    `🆔 **User ID:** ${mentionedUser.id}`,
                    `📅 **Created:** ${new Date(mentionedUser.createdTimestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`
                ];

                if (member) {
                    userInfo.push(
                        `📥 **Joined Server:** ${new Date(member.joinedTimestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}`,
                        `👑 **Highest Role:** ${member.roles.highest.name}`,
                        `🎭 **Roles [${member.roles.cache.size}]:** ${member.roles.cache
                            .filter(role => role.name !== '@everyone')
                            .sort((a, b) => b.position - a.position)
                            .map(role => role.name)
                            .slice(0, 10)
                            .join(', ')}${member.roles.cache.size > 10 ? '...' : ''}`
                    );
                }

                const userEmbed = new WebEmbed()
                    .setColor('#5865F2')
                    .setTitle(`User Information - ${mentionedUser.tag}`)
                    .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }))
                    .setDescription(userInfo.join('\n'));

                await message.channel.send({
                    content: `${WebEmbed.hiddenEmbed}${userEmbed}`
                });
            }
        } catch (error) {
            console.error('UserInfo command error:', error);
            message.reply('❌ An error occurred while fetching user information.');
        }
    },
};