module.exports = {
    name: 'eightball',
    description: 'Ask the 8-Ball a question',
    category: 'Fun',
    aliases: ['8ball', 'fortune'],
    cooldown: 5,
    usage: '.eightball [question]\nExample: .eightball Will I win the lottery?',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const responses = [
            'Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', 'Absolutely not',
            'I would not count on it', 'It is certain', 'Cannot predict now', 'Very likely'
        ];
        const question = args.join(' ');
        if (!question) {
            return message.channel.send('You need to ask a question!');
        }
        const response = responses[Math.floor(Math.random() * responses.length)];
        message.channel.send(response);
    },
};