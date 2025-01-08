const Settings = require("../../Config/Settings.json");
const Config = require("../../Config/Config.json");

module.exports = {
    name: 'help',
    description: 'Show command list or info about specific command',
    category: 'General',
    aliases: ['commands', 'h'],
    cooldown: 3,
    usage: '.help [category]',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        try {
            const prefix = Config.BotSettings.Prefix;
            const categories = new Map();
            
            // Get commands directly from commandHandler
            const commands = message.client.commandHandler.getCommands();
            
            // Sort commands by category
            for (const [, command] of commands) {
                if (command.hidden) continue;
                
                const category = command.category || 'Uncategorized';
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                
                categories.get(category).push({
                    name: command.name,
                    description: command.description
                });
            }

            let helpMessage = 'Kukuri Client Commands:\n```\n';

            if (args.length === 0) {
                helpMessage += '\nAvailable Categories:\nUse help <category> to see commands\n\n';
                for (const category of categories.keys()) {
                    helpMessage += `${category}\n`;
                }
            } else {
                const requestedCategory = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
                if (categories.has(requestedCategory)) {
                    helpMessage += `\n== ${requestedCategory} ==\n`;
                    categories.get(requestedCategory).forEach(cmd => {
                        helpMessage += `${cmd.name} - ${cmd.description}\n`;
                    });
                } else {
                    helpMessage += 'Category not found!';
                }
            }

            helpMessage += '```';
            message.delete().catch(() => {});
            await message.channel.send(helpMessage);
            
        } catch (error) {
            console.error('Help command error:', error);
            message.channel.send('An error occurred while showing help.');
        }
    }
};