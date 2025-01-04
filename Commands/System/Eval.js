const path = require('path');
const { inspect } = require('util');
const configPath = path.join(__dirname, '../../Config/Config.json');
const config = require(configPath);

module.exports = {
    name: 'eval',
    description: '(DEBUG): Evaluates JavaScript code',
    category: 'Admin',
    async execute(message, args) {
        if (message.author.id !== config.GeneralSettings.OwnerID && 
            !config.BotSettings.BotAdmins.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        try {
            const code = args.join(' ');
            if (!code) return message.channel.send('Please provide code to evaluate.');

            let evaled = await eval(code);
            
            if (typeof evaled !== 'string') {
                evaled = inspect(evaled, { depth: 0 });
            }

            if (evaled.length > 1900) {
                evaled = evaled.slice(0, 1900) + '...';
            }

            message.channel.send(`\`\`\`js\n${evaled}\n\`\`\``);
        } catch (error) {
            message.channel.send(`\`\`\`js\nError: ${error}\n\`\`\``);
        }
    },
};