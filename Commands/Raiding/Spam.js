module.exports = {
    name: 'spam',
    description: 'Send messages repeatedly',
    category: 'Raid',
    aliases: ['repeat', 'flooding'],
    cooldown: 5,
    usage: '.spam "text" [interval] [count]',
    execute: async (message, args, client) => {
        if (args.length < 3) return message.channel.send('Example: spam "Text" [interval in seconds] [number of times]');

        let spamMessage = '';
        let remainingArgs = [];
        
        if (!args[0].startsWith('"')) return message.channel.send('Please enclose the message in quotes (").');
            
        let msgParts = [];
        let foundEndQuote = false;
        
        for (let i = 0; i < args.length; i++) {
            msgParts.push(args[i]);
            if (args[i].endsWith('"')) {
                remainingArgs = args.slice(i + 1);
                foundEndQuote = true;
                break;
            }
        }
        
        if (!foundEndQuote) return message.channel.send('Please ensure the message is properly enclosed in quotes (").');
        spamMessage = msgParts.join(' ').slice(1, -1);

        if (remainingArgs.length !== 2) return message.channel.send('Please specify the interval and number of times.');

        const interval = parseFloat(remainingArgs[0]);
        const count = parseInt(remainingArgs[1]);

        if (isNaN(interval) || interval <= -1) return message.channel.send('Invalid interval.');
        if (isNaN(count) || count <= -1 || count > 100) return message.channel.send('Count must be between 0-100.');

        let sent = 0;
        let shouldStop = false;

        message.channel.send(`Starting spam: "${spamMessage}" ${count} times, every ${interval} seconds.`);

        const filter = m => m.content.toLowerCase() === 'stopspam';
        const collector = message.channel.createMessageCollector({ filter });
        
        collector.on('collect', () => {
            shouldStop = true;
            collector.stop();
            message.channel.send('✅ Stopped spam messages.');
        });

        while (sent < count && !shouldStop) {
            await message.channel.send(spamMessage);
            sent++;
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
        }

        collector.stop();
    }
};