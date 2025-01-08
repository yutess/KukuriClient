const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'channel',
    description: 'Manage server channels',
    category: 'Moderate',
    aliases: ['ch'],
    cooldown: 5,
    usage: '.channel [action] [#channel] [options]',
    permissions: ['MANAGE_CHANNELS'],
    execute: async (message, args, client) => {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MANAGE_CHANNELS')) {
                return message.channel.send('You do not have permission to manage channels');
            }

            if (!args[0]) {
                return message.channel.send(
                    'Usage:\n' +
                    '.channel create [type] [name] - Create new channel (text/voice/category)\n' +
                    '.channel delete #channel - Delete channel\n' +
                    '.channel rename #channel [newname] - Rename channel\n' +
                    '.channel topic #channel [newtopic] - Set channel topic\n' +
                    '.channel nsfw #channel [on/off] - Toggle NSFW\n' +
                    '.channel clone #channel - Clone channel\n' +
                    '.channel info #channel - Show channel info'
                );
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'create': {
                    if (args.length < 3) {
                        return message.channel.send('Please provide channel type and name');
                    }

                    const type = args[1].toLowerCase();
                    const name = args.slice(2).join('-').toLowerCase();

                    if (!['text', 'voice', 'category'].includes(type)) {
                        return message.channel.send('Invalid channel type. Must be text, voice, or category');
                    }

                    // Map channel types correctly
                    const channelTypes = {
                        'text': 'GUILD_TEXT',
                        'voice': 'GUILD_VOICE',
                        'category': 'GUILD_CATEGORY'
                    };

                    const newChannel = await message.guild.channels.create(name, {
                        type: channelTypes[type],
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                allow: ['VIEW_CHANNEL'],
                            }
                        ]
                    });

                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('Channel Created')
                        .setDescription(`Created new ${type} channel: ${newChannel.name}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'delete': {
                    const channel = message.mentions.channels.first() || message.channel;
                    const channelName = channel.name;

                    await channel.delete();

                    const embed = new WebEmbed()
                        .setColor('RED')
                        .setTitle('Channel Deleted')
                        .setDescription(`Deleted channel: ${channelName}`);

                    if (message.channel.id !== channel.id) {
                        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    }
                    break;
                }

                case 'rename': {
                    const channel = message.mentions.channels.first() || message.channel;
                    const newName = args.slice(2).join('-').toLowerCase();

                    if (!newName) {
                        return message.channel.send('Please provide a new name');
                    }

                    await channel.setName(newName);

                    const embed = new WebEmbed()
                        .setColor('BLUE')
                        .setTitle('Channel Renamed')
                        .setDescription(`Renamed channel to: ${newName}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'topic': {
                    const channel = message.mentions.channels.first() || message.channel;
                    const newTopic = args.slice(2).join(' ');

                    if (!channel.isText()) {
                        return message.channel.send('This command only works on text channels');
                    }

                    await channel.setTopic(newTopic);

                    const embed = new WebEmbed()
                        .setColor('BLUE')
                        .setTitle('Channel Topic Updated')
                        .setDescription(`Updated ${channel.name}'s topic to: ${newTopic || 'None'}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'nsfw': {
                    const channel = message.mentions.channels.first() || message.channel;
                    const setting = args[2]?.toLowerCase();

                    if (!channel.isText()) {
                        return message.channel.send('This command only works on text channels');
                    }

                    if (!['on', 'off'].includes(setting)) {
                        return message.channel.send('Please specify on or off');
                    }

                    await channel.setNSFW(setting === 'on');

                    const embed = new WebEmbed()
                        .setColor(setting === 'on' ? 'RED' : 'GREEN')
                        .setTitle('NSFW Setting Updated')
                        .setDescription(`${channel.name} NSFW setting: ${setting.toUpperCase()}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'clone': {
                    const channel = message.mentions.channels.first() || message.channel;
                    
                    const clonedChannel = await channel.clone({
                        name: `${channel.name}-clone`
                    });

                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('Channel Cloned')
                        .setDescription(`Cloned ${channel.name} to ${clonedChannel.name}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'info': {
                    const channel = message.mentions.channels.first() || message.channel;
                    const createdAt = new Date(channel.createdTimestamp).toLocaleString();

                    const infoEmbed = new WebEmbed()
                        .setColor('BLUE')
                        .setTitle(`Channel Information: ${channel.name}`)
                        .setDescription([
                            `ID: ${channel.id}`,
                            `Type: ${channel.type}`,
                            `Created: ${createdAt}`,
                            `Category: ${channel.parent?.name || 'None'}`,
                            `Position: ${channel.position}`,
                            channel.isText() ? `Topic: ${channel.topic || 'None'}` : '',
                            channel.isText() ? `NSFW: ${channel.nsfw ? 'Yes' : 'No'}` : '',
                            channel.isVoice() ? `User Limit: ${channel.userLimit || 'None'}` : '',
                            channel.isVoice() ? `Bitrate: ${channel.bitrate / 1000}kbps` : ''
                        ].filter(Boolean).join('\n'));

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${infoEmbed}` });
                    break;
                }

                default: {
                    return message.channel.send('Invalid action. Use .channel for help');
                }
            }

        } catch (error) {
            Logger.expection(`Error executing channel command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing channels');
        }
    }
};