const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'joke',
    description: 'Send a random joke',
    category: 'Fun',
    aliases: ['telljoke', 'randomjoke'],
    cooldown: 5,
    usage: '.joke',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const jokes = messageData.Joke.Message;
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        message.channel.send(joke);
    },
};
