const { WebEmbed } = require('discord.js-selfbot-v13');
const Settings = require("../Config/Settings.json");

module.exports = {
    name: 'help',
    description: 'Show this help message',
    execute(message, args, client) {
        const prefix = Settings.prefix;
        const helpEmbed = new WebEmbed()
            .setColor('BLUE')
            .setTitle('Kukuri Client Commands')
            .setDescription(
                client.commands.map(command => `${prefix}${command.name} - ${command.description}`).join('\n')
            );
        message.channel.send({ content: `Help ${WebEmbed.hiddenEmbed}${helpEmbed}` });
    },
};