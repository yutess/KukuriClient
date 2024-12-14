const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Logger = require('../Module/Logger');

module.exports = {
    name: 'mutesetup',
    description: 'Setup mute role ID',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.reply('This command can only be used in a server');
            }

            const member = message.guild.members.cache.get(client.user.id);
            if (!member.permissions.has('MANAGE_ROLES')) {
                return message.reply('Bot does not have permission to manage roles');
            }

            if (!args[0]) {
                return message.reply('Please provide a Role ID\nExample: .mutesetup [Role ID]');
            }

            const roleId = args[0];
            const configPath = path.join(__dirname, '..', 'Config', 'Roles.json');

            const role = await message.guild.roles.fetch(roleId).catch(() => null);
            if (!role) {
                return message.reply('Invalid Role ID. Please check and try again');
            }

            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            }
            
            config.muteRoleId = roleId;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const embed = new WebEmbed()
                .setColor('GREEN')
                .setTitle('✅ Setup Complete')
                .setDescription(`Mute role has been set to ${role.name} (${role.id})`);

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });

        } catch (error) {
            Logger.expection(`Error: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.reply('An error occurred during setup. Please try again');
        }
    }
};