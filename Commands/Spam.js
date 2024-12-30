module.exports = {
    name: 'spam',
    description: 'Send messages repeatedly with a customizable interval',
    execute(message, args, client) {
        if (args.length < 3) {
            return message.reply('Example: spam "Text" [interval in seconds] [number of times]');
        }

        let spamMessage = '';
        let remainingArgs = [];
        
        // Check if the message starts with a quote
        if (args[0].startsWith('"')) {
            let msgParts = [];
            let foundEndQuote = false;
            
            // Collect all parts of the quoted message
            for (let i = 0; i < args.length; i++) {
                msgParts.push(args[i]);
                if (args[i].endsWith('"')) {
                    remainingArgs = args.slice(i + 1);
                    foundEndQuote = true;
                    break;
                }
            }
            
            if (!foundEndQuote) {
                return message.reply('Please ensure the message is properly enclosed in quotes (").');
            }
            
            spamMessage = msgParts.join(' ').slice(1, -1); // Remove quotes
        } else {
            return message.reply('Please enclose the message in quotes (").');
        }

        // Validate remaining arguments
        if (remainingArgs.length !== 2) {
            return message.reply('Please specify the interval (in seconds) and the number of times to send the message.');
        }

        const interval = parseFloat(remainingArgs[0]);
        const count = parseInt(remainingArgs[1]);

        // Validate numbers
        if (isNaN(interval) || interval <= -1) {
            return message.reply('Please provide a valid interval greater than -1.');
        }

        if (isNaN(count) || count <= -1 || count > 100) {
            return message.reply('Please provide a valid number of times between 0 and 100.');
        }

        message.reply(`Starting to send the message "${spamMessage}" ${count} times, every ${interval} seconds.`);

        let sent = 0;
        const timer = setInterval(() => {
            if (sent >= count) {
                clearInterval(timer);
                console.log('Message sending complete.');
                return;
            }
            message.channel.send(spamMessage);
            sent++;
        }, interval * 1000);
    },
};
