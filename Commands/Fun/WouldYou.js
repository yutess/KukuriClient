const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'wyr',
    description: 'Send a random would you rather question',
    category: 'Fun',
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const wy = messageData.WouldYou.Message;
        const ms = wy[Math.floor(Math.random() * wy.length)];
        message.channel.send(ms);
    },
};
