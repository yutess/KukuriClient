const { WebEmbed } = require('discord.js-selfbot-v13');
const { Solver } = require('2captcha');
const config = require('../../Config/Config.json');
const Logger = require('../../Module/Logger');

// Store active logs
const activeLogs = new Map();

// Helper function to split long messages
function splitMessage(content, maxLength = 3900) {
    const parts = [];
    while (content.length > 0) {
        let part = content.substring(0, maxLength);
        content = content.substring(maxLength);
        parts.push(part);
    }
    return parts;
}

// Helper function to send large embeds
async function sendLargeEmbed(channel, embed) {
    try {
        // Check if the description is too long
        if (embed.description.length > 3900) {
            const parts = splitMessage(embed.description);
            for (let i = 0; i < parts.length; i++) {
                const newEmbed = new WebEmbed()
                    .setTitle(`${embed.title} (Part ${i + 1}/${parts.length})`)
                    .setColor(embed.color)
                    .setDescription(parts[i]);
                await channel.send({ content: `${WebEmbed.hiddenEmbed}${newEmbed}` });
            }
        } else {
            await channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
        }
    } catch (error) {
        //Logger.expection(`Failed to send log message: ${error.message}`);
    }
}

module.exports = {
    name: 'messagelog',
    description: 'Log user messages, edits, and deletions',
    category: 'System',
    aliases: ['logs', 'logging'],
    cooldown: 5,
    usage: '.logs <message> <@user/id> <channel id> <server id>',
    permissions: ['ADMINISTRATOR'],
    ownerOnly: true,
    execute: async (message, args, client) => {
        if (message.author.id !== config.GeneralSettings.OwnerID && 
            !config.BotSettings.BotAdmins.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        // Check for captcha solver
        if (config.CaptchaSettings.IgnoreSolverRequired === false) {
            if (!config.CaptchaSettings?.Enabled || !config.CaptchaSettings?.ApiKey) {
                return message.channel.send('Captcha solver is required for message logging. Please configure it in Config.json');
            }
        }

        // Handle stop command
        if (args[0] === 'stop') {
            return this.handleStop(message, args, client);
        }

        if (args[0] !== 'message') {
            return message.channel.send('Currently only message logging is supported. Use: .logs message <@user/id> <log channel id> <server id>');
        }

        if (args.length !== 4) {
            return message.channel.send('Usage: .logs message <@user/id> <log channel id> <server id>');
        }

        // Get target user
        let targetUser;
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        } else {
            try {
                targetUser = await client.users.fetch(args[1]);
            } catch (error) {
                return message.channel.send('Invalid user ID or mention.');
            }
        }

        // Get log channel
        const logChannel = client.channels.cache.get(args[2]);
        if (!logChannel) {
            return message.channel.send('Invalid log channel ID.');
        }

        // Get target server
        const targetGuild = client.guilds.cache.get(args[3]);
        if (!targetGuild) {
            return message.channel.send('Invalid server ID or bot is not in the server.');
        }

        // Check if already logging this user
        const logKey = `${targetUser.id}-${targetGuild.id}`;
        if (activeLogs.has(logKey)) {
            return message.channel.send('Already logging this user in this server.');
        }

        // Setup message collector and handlers
        const setupMessageLogging = () => {
            const handlers = {
                messageCreate: async (msg) => {
                    if (msg.author.id === targetUser.id && msg.guildId === targetGuild.id) {
                        let description = [
                            `Author: ${msg.author.tag}`,
                            `Channel: ${msg.channel.name} (${msg.channel.id})`,
                            `Content: ${msg.content || 'No content'}`,
                            `Time: ${new Date().toLocaleString()}`
                        ].join('\n');

                        if (msg.attachments.size > 0) {
                            description += '\nAttachments:';
                            msg.attachments.forEach(att => {
                                description += `\n${att.url}`;
                            });
                        }

                        const embed = new WebEmbed()
                            .setTitle('Message Created')
                            .setColor('#00FF00')
                            .setDescription(description);

                        await sendLargeEmbed(logChannel, embed);
                    }
                },
                messageUpdate: async (oldMsg, newMsg) => {
                    if (newMsg.author?.id === targetUser.id && newMsg.guildId === targetGuild.id) {
                        let description = [
                            `Author: ${newMsg.author.tag}`,
                            `Channel: ${newMsg.channel.name} (${newMsg.channel.id})`,
                            `Old Content: ${oldMsg.content || 'No content'}`,
                            `New Content: ${newMsg.content || 'No content'}`,
                            `Time: ${new Date().toLocaleString()}`
                        ].join('\n');

                        const embed = new WebEmbed()
                            .setTitle('Message Edited')
                            .setColor('#FFFF00')
                            .setDescription(description);

                        await sendLargeEmbed(logChannel, embed);
                    }
                },
                messageDelete: async (msg) => {
                    if (msg.author?.id === targetUser.id && msg.guildId === targetGuild.id) {
                        let description = [
                            `Author: ${msg.author.tag}`,
                            `Channel: ${msg.channel.name} (${msg.channel.id})`,
                            `Content: ${msg.content || 'No content'}`,
                            `Time: ${new Date().toLocaleString()}`
                        ].join('\n');

                        if (msg.attachments.size > 0) {
                            description += '\nDeleted Attachments:';
                            msg.attachments.forEach(att => {
                                description += `\n${att.url}`;
                            });
                        }

                        const embed = new WebEmbed()
                            .setTitle('Message Deleted')
                            .setColor('#FF0000')
                            .setDescription(description);

                        await sendLargeEmbed(logChannel, embed);
                    }
                }
            };

            // Register handlers
            client.on('messageCreate', handlers.messageCreate);
            client.on('messageUpdate', handlers.messageUpdate);
            client.on('messageDelete', handlers.messageDelete);

            // Store handlers for cleanup
            activeLogs.set(logKey, {
                handlers,
                guild: targetGuild.id,
                channel: logChannel.id,
                user: targetUser.id
            });

            // Send confirmation
            const startEmbed = new WebEmbed()
                .setTitle('Message Logging Started')
                .setColor('#00FF00')
                .setDescription([
                    `Target User: ${targetUser.tag}`,
                    `Server: ${targetGuild.name}`,
                    `Log Channel: ${logChannel.name}`,
                    '',
                    'Type ".logs stop <user id> <server id>" to stop logging'
                ].join('\n'));

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${startEmbed}` });
            
            // Log to console
            Logger.info(`Started message logging for ${targetUser.tag} in ${targetGuild.name}`);
        };

        setupMessageLogging();
    },

    // Handle stop command
    async handleStop(message, args, client) {
        if (args.length !== 4) {
            return message.channel.send('Usage: .logs stop <user id> <server id>');
        }

        const logKey = `${args[2]}-${args[3]}`;
        const logInfo = activeLogs.get(logKey);

        if (!logInfo) {
            return message.channel.send('No active logging found for this user in this server.');
        }

        // Remove event listeners
        client.removeListener('messageCreate', logInfo.handlers.messageCreate);
        client.removeListener('messageUpdate', logInfo.handlers.messageUpdate);
        client.removeListener('messageDelete', logInfo.handlers.messageDelete);

        // Remove from active logs
        activeLogs.delete(logKey);

        const stopEmbed = new WebEmbed()
            .setTitle('Message Logging Stopped')
            .setColor('#FF0000')
            .setDescription([
                `User ID: ${logInfo.user}`,
                `Server ID: ${logInfo.guild}`,
                `Time: ${new Date().toLocaleString()}`
            ].join('\n'));

        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${stopEmbed}` });
        Logger.info(`Stopped message logging for user ${logInfo.user} in server ${logInfo.guild}`);
    }
};