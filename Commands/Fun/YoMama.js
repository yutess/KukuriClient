const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'yomama',
    description: 'Send a random yo momma joke',
    category: 'Fun',
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const jokes = messageData.YoMama.Message;
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        message.channel.send(joke);
    },
};
