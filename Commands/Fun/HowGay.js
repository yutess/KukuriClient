module.exports = {
    name: 'howgay',
    description: 'See how gay a person is',
    category: 'Fun',
    aliases: ['gay'],
    cooldown: 5,
    usage: '.howgay [@user]\nExample: .howgay @username',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const percentage = Math.floor(Math.random() * 101);
        message.channel.send(`${user.username} is ${percentage}% gay!`);
    },
};