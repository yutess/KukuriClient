const { WebEmbed } = require('discord.js-selfbot-v13');
const Settings = require("../Config/Settings.json");

module.exports = {
    name: 'help',
    description: 'Show this help message',
    execute(message, args, client) {
        const prefix = Settings.prefix;
        const commandList = [];
        
        // Loop Map object
        client.commands.forEach((command) => {
            commandList.push(`${prefix}${command.name} - ${command.description}`);
        });

        const helpEmbed = new WebEmbed()
            .setColor('BLUE')
            .setTitle('Kukuri Client Commands')
            .setDescription(commandList.join('\n'));

        message.channel.send({ content: `Help ${WebEmbed.hiddenEmbed}${helpEmbed}` });
    },
};