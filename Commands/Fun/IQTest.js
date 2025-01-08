module.exports = {
    name: 'iqtest',
    description: 'Test a person\'s IQ',
    category: 'Fun',
    aliases: ['iq', 'smartness'],
    cooldown: 5,
    usage: '.iqtest [@user]\nExample: .iqtest @username',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const iq = Math.floor(Math.random() * 201) + 50; // random IQ between 50 and 250
        message.channel.send(`${user.username} has an IQ of ${iq}`);
    },
};