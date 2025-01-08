module.exports = {
    name: 'ermahgerd',
    description: 'Translate text to ERMAHGERD',
    category: 'Fun',
    aliases: ['emh'],
    cooldown: 5,
    usage: '.ermahgerd',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const text = args.join(' ');
        const translated = text.replace(/[aeiou]/g, (match) => {
            switch (match) {
                case 'a':
                    return 'er';
                case 'e':
                    return 'er';
                case 'i':
                    return 'er';
                case 'o':
                    return 'er';
                case 'u':
                    return 'er';
            }
        });
        message.channel.send(translated);
    },
};