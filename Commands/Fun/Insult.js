const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'insult',
    description: 'Insult a person',
    category: 'Fun',
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const insults = messageData.Insult.Message;
        const insult = insults[Math.floor(Math.random() * insults.length)];
        message.channel.send(insult);
    },
};
