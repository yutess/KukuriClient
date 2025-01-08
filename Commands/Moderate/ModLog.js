const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');
const path = require('path');
const fs = require('fs').promises;

// Path for storing moderation logs
const modLogsPath = path.join(__dirname, '..', '..', 'data', 'modlogs.json');

// Ensure the modlogs file exists
async function initModLogs() {
    try {
        await fs.access(modLogsPath);
    } catch {
        await fs.writeFile(modLogsPath, '{}', 'utf8');
    }
}

// Load mod logs
async function loadModLogs() {
    await initModLogs();
    const data = await fs.readFile(modLogsPath, 'utf8');
    return JSON.parse(data);
}

// Save mod logs
async function saveModLogs(logs) {
    await fs.writeFile(modLogsPath, JSON.stringify(logs, null, 2), 'utf8');
}

// Add a new mod log entry
async function addModLogEntry(guildId, userId, modId, action, reason) {
    const logs = await loadModLogs();
    
    if (!logs[guildId]) {
        logs[guildId] = {};
    }
    
    if (!logs[guildId][userId]) {
        logs[guildId][userId] = [];
    }

    logs[guildId][userId].push({
        action,
        reason,
        moderator: modId,
        timestamp: new Date().toISOString()
    });

    await saveModLogs(logs);
}

module.exports = {
    name: 'modlog',
    description: 'View and manage moderation history',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MODERATE_MEMBERS')) {
                return message.channel.send('You do not have permission to view moderation logs');
            }

            if (!args[0]) {
                return message.channel.send(
                    'Usage:\n' +
                    '.modlog view @user - View user\'s moderation history\n' +
                    '.modlog add @user [reason] - Add a note to user\'s history\n' +
                    '.modlog clear @user - Clear user\'s moderation history'
                );
            }

            const action = args[0].toLowerCase();
            const targetUser = message.mentions.users.first();

            if (!targetUser && action !== 'stats') {
                return message.channel.send('Please mention a user');
            }

            switch (action) {
                case 'view': {
                    const logs = await loadModLogs();
                    const userLogs = logs[message.guild.id]?.[targetUser.id] || [];

                    if (userLogs.length === 0) {
                        return message.channel.send('No moderation history found for this user');
                    }

                    const embed = new WebEmbed()
                        .setColor('BLUE')
                        .setTitle(`Moderation History: ${targetUser.tag}`)
                        .setDescription(
                            userLogs.map((log, index) => {
                                const date = new Date(log.timestamp).toLocaleString();
                                const mod = message.guild.members.cache.get(log.moderator)?.user.tag || 'Unknown Moderator';
                                return `${index + 1}. ${log.action} - ${log.reason}\nBy: ${mod} | Date: ${date}`;
                            }).join('\n\n')
                        );

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'add': {
                    const reason = args.slice(2).join(' ');
                    if (!reason) {
                        return message.channel.send('Please provide a reason');
                    }

                    await addModLogEntry(
                        message.guild.id,
                        targetUser.id,
                        message.author.id,
                        'Note',
                        reason
                    );

                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('Moderation Note Added')
                        .setDescription(`Added note for ${targetUser.tag}: ${reason}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'clear': {
                    const logs = await loadModLogs();
                    
                    if (logs[message.guild.id]) {
                        delete logs[message.guild.id][targetUser.id];
                        await saveModLogs(logs);
                    }

                    const embed = new WebEmbed()
                        .setColor('YELLOW')
                        .setTitle('Moderation History Cleared')
                        .setDescription(`Cleared all moderation history for ${targetUser.tag}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                default: {
                    return message.channel.send('Invalid action. Use .modlog for help');
                }
            }

        } catch (error) {
            Logger.expection(`Error executing modlog command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing moderation logs');
        }
    },

    // Export these functions so other commands can use them
    addModLogEntry
};