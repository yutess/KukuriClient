module.exports = {
    name: 'slot',
    description: 'Play the slot machine',
    category: 'Fun',
    aliases: ['slot'],
    cooldown: 5,
    usage: '.slot',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const slots = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍓', '🍈'];
        const result = [
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)]
        ];
        message.channel.send(result.join(' '));
    },
};