module.exports = {
    name: 'iseven',
    description: 'Check if a number is even',
    category: 'Fun',
    aliases: ['even', 'odd'],
    cooldown: 3,
    usage: '.iseven [number]\nExample: .iseven 42',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const number = parseInt(args[0]);
        if (isNaN(number)) {
            return message.channel.send('Please provide a valid number.');
        }
        const result = number % 2 === 0 ? 'even' : 'odd';
        message.channel.send(`The number ${number} is ${result}.`);
    },
};