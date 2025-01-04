module.exports = {
    name: 'massreact',
    description: 'Add reactions to multiple messages',
    category: 'Raid',
    async execute(message, args, client) {
        if (!args[0]) return message.channel.send('Please provide an emoji');
        
        try {
            const filter = m => m.content.toLowerCase() === 'stopreact';
            const collector = message.channel.createMessageCollector({ filter });
            let shouldStop = false;
            
            collector.on('collect', () => {
                shouldStop = true;
                collector.stop();
                message.channel.send('Stopped mass react.');
            });

            await message.delete();
            const messages = await message.channel.messages.fetch({ limit: 20 });
            
            for (const msg of messages.values()) {
                if (shouldStop) break;
                await msg.react(args[0]);
                await new Promise(r => setTimeout(r, 500));
            }

            collector.stop();
        } catch (error) {
            console.error(error);
        }
    }
};