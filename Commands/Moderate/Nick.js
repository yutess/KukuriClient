const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'nick',
    description: 'Manage user nicknames',
    category: 'Moderate',
    aliases: ['nickname'],
    cooldown: 5,
    usage: '.nick <set/reset/random> <@user> [nickname]',
    permissions: ['MANAGE_NICKNAMES'],
    execute: async (message, args, client) => {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
                return message.channel.send('You do not have permission to manage nicknames');
            }

            if (!args[0]) {
                return message.channel.send(
                    'Usage:\n' +
                    '.nick set @user [nickname] - Set user\'s nickname\n' +
                    '.nick reset @user - Reset user\'s nickname\n' +
                    '.nick random @user - Set random nickname'
                );
            }

            const action = args[0].toLowerCase();
            const member = message.mentions.members.first();

            if (!member) {
                return message.channel.send('Please mention a user');
            }

            if (!member.manageable) {
                return message.channel.send('I cannot manage this user\'s nickname');
            }

            switch (action) {
                case 'set': {
                    const newNick = args.slice(2).join(' ');
                    if (!newNick) {
                        return message.channel.send('Please provide a new nickname');
                    }

                    if (newNick.length > 32) {
                        return message.channel.send('Nickname must be 32 characters or less');
                    }

                    await member.setNickname(newNick);
                    
                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('Nickname Changed')
                        .setDescription(`Changed ${member.user.username}'s nickname to ${newNick}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'reset': {
                    await member.setNickname(null);
                    
                    const embed = new WebEmbed()
                        .setColor('YELLOW')
                        .setTitle('Nickname Reset')
                        .setDescription(`Reset ${member.user.username}'s nickname`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'random': {
                    const adjectives = ['Skibidi', 'Sigma', 'Ohio', 'Rizz', 'Mogger', 'Mewing', 'Alpha', 'Mega'];
                    const nouns = ['Sigma', 'Kukuri', 'Fanum Tax', 'Mewwing', 'Sus', 'Wolf', 'Maxxing', 'Fox'];
                    
                    const randomNick = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
                    
                    await member.setNickname(randomNick);
                    
                    const embed = new WebEmbed()
                        .setColor('BLUE')
                        .setTitle('Random Nickname Set')
                        .setDescription(`Changed ${member.user.username}'s nickname to ${randomNick}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                default: {
                    return message.channel.send('Invalid action. Use .nick for help');
                }
            }

        } catch (error) {
            Logger.expection(`Error executing nickname command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing nickname');
        }
    }
};