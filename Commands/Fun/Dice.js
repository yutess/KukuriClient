module.exports = {
    name: 'dice',
    description: 'Roll a dice',
    category: 'Fun',
    execute(message, args) {
        const roll = Math.floor(Math.random() * 6) + 1;
        message.channel.send(`You rolled a ${roll}`);
    },
};