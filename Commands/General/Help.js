const Settings = require("../../Config/Settings.json");
const Config = require("../../Config/Config.json");

module.exports = {
    name: 'help',
    description: 'Showing this message',
    category: 'General',
    async execute(message, args, client) {
        const prefix = Config.BotSettings.Prefix;
        const categories = {};
        message.delete();

        client.commands.forEach((command) => {
            const category = command.category || 'uncategorized';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                name: command.name,
                description: command.description
            });
        });

        let helpMessage = 'Kukuri Client Commands:\n```\n';
        
        if (args.length === 0) {
            // Show only categories
            helpMessage += '\nAvailable Categories:\nUse help <category> to see commands\n\n';
            Object.keys(categories).forEach((category) => {
                helpMessage += `${category}\n`;
            });
        } else {
            // Show commands for specific category
            const requestedCategory = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
            if (categories[requestedCategory]) {
                helpMessage += `\n== ${requestedCategory} ==\n`;
                categories[requestedCategory].forEach((cmd) => {
                    helpMessage += `${cmd.name} - ${cmd.description}\n`;
                });
            } else {
                helpMessage += 'Category not found!';
            }
        }
        
        helpMessage += '```';
        message.channel.send(helpMessage);
    },
};