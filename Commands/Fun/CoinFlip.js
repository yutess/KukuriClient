module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    category: 'Fun',
    execute(message, args) {
        const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
        message.channel.send(flip);
    },
};