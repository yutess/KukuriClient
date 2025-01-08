module.exports = {
    name: 'howsimp',
    description: 'See how simp a person is',
    category: 'Fun',
    aliases: ['simp'],
    cooldown: 5,
    usage: '.howsimp [@user]\nExample: .howsimp @username',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const percentage = Math.floor(Math.random() * 101);
        message.channel.send(`${user.username} is ${percentage}% simp!`);
    },
};