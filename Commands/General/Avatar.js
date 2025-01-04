module.exports = {
    name: 'avatar',
    description: 'Get user\'s avatar',
    category: 'General',
    execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        message.channel.send(user.displayAvatarURL({ dynamic: true, size: 4096 }));
    },
};