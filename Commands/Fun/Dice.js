module.exports = {
    name: 'dice',
    description: 'Roll a dice',
    category: 'Fun',
    aliases: ['roll', 'rolldice'],
    cooldown: 3,
    usage: '.dice',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const roll = Math.floor(Math.random() * 6) + 1;
        message.channel.send(`You rolled a ${roll}`);
    },
};