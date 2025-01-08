module.exports = {
    name: 'choose',
    description: 'Choose a random item from the list of items',
    category: 'Fun',
    aliases: ['pick', 'select'],
    cooldown: 3,
    usage: '.choose [option1] [option2] ...\nExample: .choose pizza burger pasta',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        if (args.length < 2) {
            return message.channel.send('You need to provide at least two options to choose from!');
        }
        const choice = args[Math.floor(Math.random() * args.length)];
        message.channel.send(`I choose: ${choice}`);
    },
};