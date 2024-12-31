const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../Config/Config.json');
let config = require(configPath);

module.exports = {
    name: 'delauth',
    description: 'Remove a user from BotAdmins',
    execute(message, args) {
        if (message.author.id !== config.GeneralSettings.OwnerID) {
            return message.reply('You do not have permission to use this command.');
        }

        const userId = args[0]?.replace(/[<@!>]/g, '');
        if (!userId) return message.reply('Please specify a valid user ID or mention.');

        const index = config.BotSettings.BotAdmins.indexOf(userId);
        if (index === -1) {
            return message.reply('This user is not in BotAdmins.');
        }

        config.BotSettings.BotAdmins.splice(index, 1);

        // Save the updated config to file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        return message.reply(`Successfully removed <@${userId}> from BotAdmins.`);
    },
};
