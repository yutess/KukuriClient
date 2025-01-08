const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'fml',
    description: 'Send a random fuck my life quote',
    category: 'Fun',
    aliases: ['fuckmylife'],
    cooldown: 5,
    usage: '.fml',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const quotes = messageData.FuckMyLife.Message;
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        message.channel.send(quote);
    },
};
