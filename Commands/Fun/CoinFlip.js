module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    category: 'Fun',
    aliases: ['flip', 'coin'],
    cooldown: 3,
    usage: '.coinflip',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
        message.channel.send(flip);
    },
};