const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'role',
    description: 'Manage server roles',
    category: 'Moderate',
    async execute(message, args, client) {
        try {
            if (!message.guild) {
                return message.channel.send('This command can only be used in a server');
            }

            if (!message.member.permissions.has('MANAGE_ROLES')) {
                return message.channel.send('You do not have permission to manage roles');
            }

            if (!args[0]) {
                return message.channel.send(
                    'Usage:\n' +
                    '.role add @user @role - Add role to user\n' +
                    '.role remove @user @role - Remove role from user\n' +
                    '.role create [name] [color] - Create new role\n' +
                    '.role delete @role - Delete role\n' +
                    '.role info @role - Show role information'
                );
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'add': {
                    const targetUser = message.mentions.members.first();
                    const role = message.mentions.roles.first();

                    if (!targetUser || !role) {
                        return message.channel.send('Please mention both a user and a role\nExample: .role add @user @role');
                    }

                    if (targetUser.roles.cache.has(role.id)) {
                        return message.channel.send('User already has this role');
                    }

                    await targetUser.roles.add(role);
                    
                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('Role Added')
                        .setDescription(`Added role ${role.name} to ${targetUser.user.username}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'remove': {
                    const targetUser = message.mentions.members.first();
                    const role = message.mentions.roles.first();

                    if (!targetUser || !role) {
                        return message.channel.send('Please mention both a user and a role\nExample: .role remove @user @role');
                    }

                    if (!targetUser.roles.cache.has(role.id)) {
                        return message.channel.send('User does not have this role');
                    }

                    await targetUser.roles.remove(role);
                    
                    const embed = new WebEmbed()
                        .setColor('YELLOW')
                        .setTitle('Role Removed')
                        .setDescription(`Removed role ${role.name} from ${targetUser.user.username}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'create': {
                    if (args.length < 2) {
                        return message.channel.send('Please provide a role name\nExample: .role create Admin #ff0000');
                    }

                    const name = args[1];
                    const color = args[2] || 'DEFAULT';

                    const newRole = await message.guild.roles.create({
                        name: name,
                        color: color,
                        reason: `Created by ${message.author.tag}`
                    });

                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setTitle('Role Created')
                        .setDescription(`Created new role: ${newRole.name}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'delete': {
                    const role = message.mentions.roles.first();

                    if (!role) {
                        return message.channel.send('Please mention a role to delete\nExample: .role delete @role');
                    }

                    const roleName = role.name;
                    await role.delete();

                    const embed = new WebEmbed()
                        .setColor('RED')
                        .setTitle('Role Deleted')
                        .setDescription(`Deleted role: ${roleName}`);

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                case 'info': {
                    const role = message.mentions.roles.first();

                    if (!role) {
                        return message.channel.send('Please mention a role\nExample: .role info @role');
                    }

                    const createdAt = role.createdAt.toLocaleDateString();
                    const memberCount = role.members.size;
                    const permissions = role.permissions.toArray().join(', ') || 'None';

                    const embed = new WebEmbed()
                        .setColor(role.color || 'BLUE')
                        .setTitle(`Role Information: ${role.name}`)
                        .setDescription([
                            `ID: ${role.id}`,
                            `Color: ${role.hexColor}`,
                            `Created: ${createdAt}`,
                            `Position: ${role.position}`,
                            `Members: ${memberCount}`,
                            `Hoisted: ${role.hoist ? 'Yes' : 'No'}`,
                            `Mentionable: ${role.mentionable ? 'Yes' : 'No'}`,
                            `Permissions: ${permissions}`
                        ].join('\n'));

                    message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
                    break;
                }

                default: {
                    return message.channel.send('Invalid action. Use .role for help');
                }
            }

        } catch (error) {
            Logger.expection(`Error executing role command: ${error.message}`);
            Logger.expection(`Full error details: ${error.stack}`);
            message.channel.send('An error occurred while managing roles');
        }
    }
};