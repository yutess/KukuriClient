module.exports = {
    name: 'ego',
    description: 'See how big a person\'s ego is',
    category: 'Fun',
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const ego = Math.floor(Math.random() * 101);
        message.channel.send(`${user.username}'s ego is ${ego}% inflated!`);
    },
};