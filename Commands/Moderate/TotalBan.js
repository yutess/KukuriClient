const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'totalbans',
    description: 'Check total bans in server',
    category: 'Moderate',
    aliases: ['banlist', 'bans'],
    cooldown: 10,
    usage: '.totalbans',
    permissions: ['BAN_MEMBERS'],
    execute: async (message, args, client) => {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('BAN_MEMBERS')) {
                return message.channel.send('You do not have permission to view bans');
            }

            // Fetch all bans
            const bans = await message.guild.bans.fetch();
            
            if (bans.size === 0) {
                const emptyEmbed = new WebEmbed()
                    .setColor('GREEN')
                    .setTitle('Server Bans')
                    .setDescription('No banned users found in this server');
                
                return message.channel.send({ content: `${WebEmbed.hiddenEmbed}${emptyEmbed}` });
            }

            // Get recent bans (last 10)
            const recentBans = bans.first(10);
            
            const banList = recentBans.map((ban, index) => {
                return `${index + 1}. ${ban.user.tag} (${ban.user.id})\n   Reason: ${ban.reason || 'No reason provided'}`;
            }).join('\n\n');

            const embed = new WebEmbed()
                .setColor('RED')
                .setTitle('Server Bans')
                .setDescription(`Total Bans: ${bans.size}\n\nRecent Bans:\n${banList}`);

            if (bans.size > 10) {
                embed.setDescription(embed.description + '\n\nShowing 10 most recent bans.');
            }

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });

        } catch (error) {
            Logger.expection(`Error executing bans command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while fetching server bans');
        }
    }
};