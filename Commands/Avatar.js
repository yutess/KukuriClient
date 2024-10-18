module.exports = {
    name: 'avatar',
    description: 'Get user\'s avatar',
    execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        message.reply(user.displayAvatarURL({ dynamic: true, size: 4096 }));
    },
};