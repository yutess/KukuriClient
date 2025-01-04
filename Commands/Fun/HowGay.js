module.exports = {
    name: 'howgay',
    description: 'See how gay a person is',
    category: 'Fun',
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const percentage = Math.floor(Math.random() * 101);
        message.channel.send(`${user.username} is ${percentage}% gay!`);
    },
};