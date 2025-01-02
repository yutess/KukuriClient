const Settings = require("../Config/Settings.json");
const Config = require("../Config/Config.json");

module.exports = {
    name: 'help',
    description: 'Show this help message',
    async execute(message, args, client) {
        const prefix = Config.BotSettings.Prefix;
        const commandList = [];
        message.delete()
        // Collect commands
        client.commands.forEach((command) => {
            commandList.push(`${prefix}${command.name} - ${command.description}`);
        });
        // Send Text if no permission to attach files
        const textResponse = `Kukuri Client Commands:\n\`\`\`\n${commandList.join('\n')}\n\`\`\`\nUse the commands wisely!`;
        message.channel.send(textResponse);
    },
};
