const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'voice',
    description: 'Manage voice channels',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MANAGE_CHANNELS')) {
                return message.channel.send('You do not have permission to manage voice channels');
            }

            if (!args[0]) {
                return message.channel.send(
                    'Usage:\n' +
                    '.voice mute @user - Mute user in voice channel\n' +
                    '.voice unmute @user - Unmute user in voice channel\n' +
                    '.voice deafen @user - Deafen user in voice channel\n' +
                    '.voice undeafen @user - Undeafen user in voice channel\n' +
                    '.voice disconnect @user - Disconnect user from voice channel\n' +
                    '.voice limit #channel [limit] - Set user limit for voice channel'
                );
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'mute': {
                    const member = message.mentions.members.first();
                    if (!member) {
                        return message.channel.send('Please mention a user');
                    }
                    if (!member.voice.channel) {
                        return message.channel.send('User is not in a voice channel');
                    }
                    await member.voice.setMute(true);
                    const embed = new WebEmbed()
                        .setColor('RED')
                        .setTitle('User Muted')
                        .setDescription(`${member.user.username} has been muted in voice channels`);
                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'unmute': {
                    const member = message.mentions.members.first();
                    if (!member) {
                        return message.channel.send('Please mention a user');
                    }
                    if (!member.voice.channel) {
                        return message.channel.send('User is not in a voice channel');
                    }
                    await member.voice.setMute(false);
                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('User Unmuted')
                        .setDescription(`${member.user.username} has been unmuted in voice channels`);
                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'deafen': {
                    const member = message.mentions.members.first();
                    if (!member) {
                        return message.channel.send('Please mention a user');
                    }
                    if (!member.voice.channel) {
                        return message.channel.send('User is not in a voice channel');
                    }
                    await member.voice.setDeaf(true);
                    const embed = new WebEmbed()
                        .setColor('RED')
                        .setTitle('User Deafened')
                        .setDescription(`${member.user.username} has been deafened in voice channels`);
                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'undeafen': {
                    const member = message.mentions.members.first();
                    if (!member) {
                        return message.channel.send('Please mention a user');
                    }
                    if (!member.voice.channel) {
                        return message.channel.send('User is not in a voice channel');
                    }
                    await member.voice.setDeaf(false);
                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('User Undeafened')
                        .setDescription(`${member.user.username} has been undeafened in voice channels`);
                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'disconnect': {
                    const member = message.mentions.members.first();
                    if (!member) {
                        return message.channel.send('Please mention a user');
                    }
                    if (!member.voice.channel) {
                        return message.channel.send('User is not in a voice channel');
                    }
                    await member.voice.disconnect();
                    const embed = new WebEmbed()
                        .setColor('YELLOW')
                        .setTitle('User Disconnected')
                        .setDescription(`${member.user.username} has been disconnected from voice channel`);
                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'limit': {
                    const channel = message.mentions.channels.first();
                    const limit = parseInt(args[2]);
                    
                    if (!channel || !channel.isVoice()) {
                        return message.channel.send('Please mention a valid voice channel');
                    }
                    
                    if (isNaN(limit) || limit < 0 || limit > 99) {
                        return message.channel.send('Please provide a valid limit between 0 and 99');
                    }

                    await channel.setUserLimit(limit);
                    const embed = new WebEmbed()
                        .setColor('BLUE')
                        .setTitle('Voice Channel Limit Set')
                        .setDescription(`Set user limit for ${channel.name} to ${limit}`);
                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                default: {
                    return message.channel.send('Invalid action. Use .voice for help');
                }
            }

        } catch (error) {
            Logger.expection(`Error executing voice command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing voice channels');
        }
    }
};