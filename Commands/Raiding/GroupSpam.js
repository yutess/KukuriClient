const { WebEmbed } = require('discord.js-selfbot-v13');
const { Solver } = require('2captcha');
const config = require('../../Config/Config.json');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'groupspam',
    description: 'Send a message to all visible users in a specific channel',
    category: 'Raid',
    aliases: ['gspam'],
    cooldown: 5,
    usage: '.groupspam [channel id] "Text" [interval in seconds] [number of messages]',
    execute: async (message, args, client) => {
        // Permission check
        if (message.author.id !== config.GeneralSettings.OwnerID && 
            !config.BotSettings.BotAdmins.includes(message.author.id)) {
            return message.channel.send('You do not have permission to use this command.');
        }

        if (args.length < 4) return message.channel.send('Example: groupspam [channel id] "Text" [interval in seconds] [number of messages]');

        let spamMessage = '';
        let remainingArgs = [];
        
        if (!args[1].startsWith('"')) return message.channel.send('Please enclose the message in quotes (").');
            
        let msgParts = [];
        let foundEndQuote = false;
        
        for (let i = 1; i < args.length; i++) {
            msgParts.push(args[i]);
            if (args[i].endsWith('"')) {
                remainingArgs = args.slice(i + 1);
                foundEndQuote = true;
                break;
            }
        }
        
        if (!foundEndQuote) return message.channel.send('Please ensure the message is properly enclosed in quotes (").');
        spamMessage = msgParts.join(' ').slice(1, -1);

        if (remainingArgs.length !== 2) return message.channel.send('Please specify the interval and number of messages.');

        const channelId = args[0];
        const interval = parseFloat(remainingArgs[0]);
        const count = parseInt(remainingArgs[1]);

        if (isNaN(interval) || interval <= -1) return message.channel.send('Invalid interval.');
        if (isNaN(count) || count <= -1 || count > 100) return message.channel.send('Count must be between 0-100.');

        const targetChannel = client.channels.cache.get(channelId);
        if (!targetChannel) return message.channel.send('Invalid channel ID.');

        const messages = await targetChannel.messages.fetch({ limit: 100 });
        
        // Filter out bots, self, and get unique users
        const uniqueUsers = [...new Set(messages.map(msg => msg.author.id))]
            .filter(id => {
                const user = client.users.cache.get(id);
                return user && !user.bot && id !== client.user.id;
            });

        let sent = 0;
        let failed = 0;
        let shouldStop = false;

        // Create status embed
        const statusEmbed = new WebEmbed()
            .setTitle('Group Spam Status')
            .setColor('#FF0000')
            .setDescription('Initializing...');
        
        const statusMessage = await message.channel.send({ 
            content: `${WebEmbed.hiddenEmbed}${statusEmbed}` 
        });

        // Setup stop collector
        const filter = m => m.content.toLowerCase() === 'stopspam' && 
            (m.author.id === message.author.id || config.BotSettings.BotAdmins.includes(m.author.id));
        const collector = message.channel.createMessageCollector({ filter });
        
        collector.on('collect', () => {
            shouldStop = true;
            collector.stop();
            message.channel.send('✅ Stopping group spam...');
        });

        // Update status function
        const updateStatus = async () => {
            const progress = Math.round((sent + failed) / uniqueUsers.length * 100);
            const updatedEmbed = new WebEmbed()
                .setTitle('Group Spam Status')
                .setColor(shouldStop ? '#FF0000' : '#00FF00')
                .setDescription([
                    `Progress: ${progress}%`,
                    `Total Users: ${uniqueUsers.length}`,
                    `Sent: ${sent}`,
                    `Failed: ${failed}`,
                    '',
                    'Type "stopspam" to stop'
                ].join('\n'));
            
            await statusMessage.edit({ 
                content: `${WebEmbed.hiddenEmbed}${updatedEmbed}` 
            });
        };

        // Send messages to channel
        let messageCount = 0;
        while (messageCount < count && !shouldStop) {
            try {
                await targetChannel.send(spamMessage);
                sent++;
                messageCount++;
                Logger.info(`Successfully sent message ${messageCount}/${count}`);
            } catch (error) {
                failed++;
                Logger.expection(`Failed to send message: ${error.message}`);
            }

            await updateStatus();
            if (interval > 0) {
                await new Promise(resolve => setTimeout(resolve, interval * 1000));
            }
        }

        collector.stop();
        
        // Final update
        const finalEmbed = new WebEmbed()
            .setTitle('Group Spam Completed')
            .setColor('#00FF00')
            .setDescription([
                `Total Messages Attempted: ${count}`,
                `Successfully Sent: ${sent}`,
                `Failed: ${failed}`
            ].join('\n'));

        await statusMessage.edit({ 
            content: `${WebEmbed.hiddenEmbed}${finalEmbed}` 
        });
    }
};