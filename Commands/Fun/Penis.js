module.exports = {
    name: 'penis',
    description: 'See how big a person\'s penis is',
    category: 'Fun',
    aliases: ['dick'],
    cooldown: 5,
    usage: '.penis [@user]\nExample: .penis @username',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const size = Math.floor(Math.random() * 30) + 10; // random size between 10 and 40
        message.channel.send(`${user.username}'s penis is ${size}cm long!`);
    },
};