const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../Config/Config.json');
let config = require(configPath);

module.exports = {
    name: 'auth',
    description: 'Add a user to BotAdmins',
    category: 'Admin',
    execute(message, args) {
        if (message.author.id !== config.GeneralSettings.OwnerID) {
            return message.channel.send('You do not have permission to use this command.');
        }

        const userId = args[0]?.replace(/[<@!>]/g, '');
        if (!userId) return message.channel.send('Please specify a valid user ID or mention.');

        if (config.BotSettings.BotAdmins.includes(userId)) {
            return message.channel.send('This user is already in BotAdmins.');
        }

        config.BotSettings.BotAdmins.push(userId);

        // Save the updated config to file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        return message.channel.send(`Successfully added <@${userId}> to BotAdmins.`);
    },
};
