const { execSync } = require('child_process');
const { WebEmbed } = require('discord.js-selfbot-v13');
const path = require('path');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'restart',
    description: 'Restart the client',
    category: 'System',
    aliases: ['reboot', 'reload'],
    cooldown: 30,
    usage: '.restart',
    permissions: ['ADMINISTRATOR'],
    ownerOnly: true,
    execute: async (message, args, client) => {
        try {
            const config = require('../../Config/Config.json');
            if (message.author.id !== config.GeneralSettings.OwnerID && 
                !config.BotSettings.BotAdmins.includes(message.author.id)) {
                return message.channel.send('You do not have permission to use this command.');
            }

            const restartEmbed = new WebEmbed()
                .setColor('#FF0000')
                .setTitle('🔄 Client Restart')
                .setDescription('Client is restarting...\nPlease wait a moment.')
                .setTimestamp();

            await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${restartEmbed}` });

            Logger.info('Client restart initiated by ' + message.author.tag);

            setTimeout(() => {
                try {
                    const scriptPath = path.join(__dirname, '..', '..', 'Main.js');
                    execSync(`node "${scriptPath}"`);
                    process.exit();
                } catch (error) {
                    Logger.expection('Failed to restart: ' + error.message);
                    message.channel.send('Failed to restart client. Please check logs.');
                }
            }, 1000);

        } catch (error) {
            Logger.expection('Error in restart command: ' + error.message);
            message.channel.send('An error occurred while trying to restart.');
        }
    },
};