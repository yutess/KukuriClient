const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs').promises;
const path = require('path');
const Logger = require('../../Module/Logger');

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

async function loadWarnings() {
    try {
        const data = await fs.readFile(warningsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(warningsPath, '{}', 'utf8');
            return {};
        }
        throw error;
    }
}

async function saveWarnings(warnings) {
    await fs.writeFile(warningsPath, JSON.stringify(warnings, null, 2), 'utf8');
}

module.exports = {
    name: 'warn',
    description: 'Warn a user and manage warnings',
    category: 'Moderate',
    aliases: ['warning'],
    cooldown: 5,
    usage: '.warn <@user> [reason]',
    permissions: ['MODERATE_MEMBERS'],
    execute: async (message, args, client) => {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MODERATE_MEMBERS')) {
                return message.channel.send('You do not have permission to warn members');
            }

            if (!args[0]) {
                return message.channel.send('Usage:\n.warn @user [reason]\n.warn check @user\n.warn clear @user');
            }

            if (args[0].toLowerCase() === 'check') {
                // Check warnings
                const targetUser = message.mentions.users.first();
                if (!targetUser) {
                    return message.channel.send('Please mention a user to check warnings');
                }

                const warnings = await loadWarnings();
                const userWarnings = warnings[targetUser.id] || [];

                const embed = new WebEmbed()
                    .setColor('BLUE')
                    .setTitle(`Warnings for ${targetUser.username}`)
                    .setDescription(
                        userWarnings.length > 0
                            ? userWarnings.map((w, i) => `${i + 1}. ${w.reason} (${w.date})`).join('\n')
                            : 'No warnings found'
                    );

                return message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
            }

            if (args[0].toLowerCase() === 'clear') {
                // Clear warnings
                const targetUser = message.mentions.users.first();
                if (!targetUser) {
                    return message.channel.send('Please mention a user to clear warnings');
                }

                const warnings = await loadWarnings();
                delete warnings[targetUser.id];
                await saveWarnings(warnings);

                const embed = new WebEmbed()
                    .setColor('GREEN')
                    .setTitle('Warnings Cleared')
                    .setDescription(`All warnings have been cleared for ${targetUser.username}`);

                return message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
            }

            // Add warning
            const targetUser = message.mentions.users.first();
            if (!targetUser) {
                return message.channel.send('Please mention a user to warn');
            }

            const reason = args.slice(1).join(' ') || 'No reason provided';
            const warnings = await loadWarnings();

            if (!warnings[targetUser.id]) {
                warnings[targetUser.id] = [];
            }

            warnings[targetUser.id].push({
                reason,
                date: new Date().toLocaleDateString(),
                moderator: message.author.id
            });

            await saveWarnings(warnings);

            const embed = new WebEmbed()
                .setColor('YELLOW')
                .setTitle('User Warned')
                .setDescription(`${targetUser.username} has been warned\nReason: ${reason}\nTotal Warnings: ${warnings[targetUser.id].length}`);

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });

        } catch (error) {
            Logger.expection(`Error executing warn command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing warnings');
        }
    }
};