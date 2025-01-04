const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'mute',
    description: 'Mute a user with specified role',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            const member = message.guild.members.cache.get(client.user.id);
            if (!member.permissions.has('MANAGE_ROLES')) {
                return message.channel.send('Bot does not have permission to manage roles');
            }

            if (!message.mentions.members.first()) {
                return message.channel.send('Please mention a user to mute\nExample: .mute @user');
            }

            // Load config
            const configPath = path.join(__dirname, '..', '..', 'Config', 'Roles.json');
            let config = {};

            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            } else {
                config = { muteRoleId: '' };
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }

            if (!config.muteRoleId) {
                const embed = new WebEmbed()
                    .setColor('RED')
                    .setTitle('⚠️ Mute Role Required')
                    .setDescription('Please set up the mute role first\nUse command: .mutesetup [Role ID]');

                return message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
            }

            const targetMember = message.mentions.members.first();
            const muteRole = await message.guild.roles.fetch(config.muteRoleId);

            if (!muteRole) {
                return message.channel.send('Mute role not found. Please check the role ID');
            }

            if (targetMember.roles.cache.has(muteRole.id)) {
                return message.channel.send('This user is already muted');
            }

            // Apply mute
            await targetMember.roles.add(muteRole);

            const successEmbed = new WebEmbed()
                .setColor('GREEN')
                .setTitle('✅ Successfully Muted')
                .setDescription(`${targetMember.user.username} has been muted`);

            message.channel.send({ content: `${WebEmbed.hiddenEmbed}${successEmbed}` });

        } catch (error) {
            Logger.expection(`Error executing command mute: ${error.message}`);
            Logger.expection(`Command error full details: ${error.stack}`);
            message.channel.send('An error occurred while trying to mute. Please try again');
        }
    }
};