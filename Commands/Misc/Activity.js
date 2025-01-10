module.exports = {
    name: 'activity',
    description: 'Set your Discord activity status',
    category: 'Misc',
    cooldown: 5,
    usage: `.activity <type> <name> [platform]\nTypes: playing, streaming, listening, watching, competing\nPlatforms: desktop, mobile, web, samsung, xbox, ios, android, embedded, ps4, ps5\nExample: .activity playing Minecraft desktop`,
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (!args[0]) {
            return message.channel.send('Please provide activity type and name.\n```ml\nUsage: .activity <type> <name> [platform]\nTypes: playing, streaming, listening, watching, competing\nPlatforms: desktop, mobile, web, samsung, xbox, ios, android, embedded, ps4, ps5\nExample: .activity playing Kukuri! desktop\n```');
        }

        if (args[0].toLowerCase() === 'stop') {
            try {
                await client.user.setActivity(null);
                return message.channel.send('✅ Activity stopped.');
            } catch (error) {
                console.error('Error stopping activity:', error);
                return message.channel.send('❌ Failed to stop activity.');
            }
        }

        const validTypes = ['playing', 'streaming', 'listening', 'watching', 'competing'];
        const validPlatforms = ['desktop', 'mobile', 'web', 'samsung', 'xbox', 'ios', 'android', 'embedded', 'ps4', 'ps5'];
        
        const type = args[0].toLowerCase();
        if (!validTypes.includes(type)) {
            return message.channel.send(`Invalid activity type. Use: ${validTypes.join(', ')}`);
        }

        if (args.length < 2) {
            return message.channel.send('Please provide an activity name.');
        }

        let platform = 'desktop';
        let name = args.slice(1).join(' ');

        // Check if last argument is a platform
        const lastArg = args[args.length - 1].toLowerCase();
        if (validPlatforms.includes(lastArg)) {
            platform = lastArg;
            name = args.slice(1, -1).join(' ');
        }

        let activityOptions = {
            name: name,
            platform: platform
        };

        // Add streaming URL if type is streaming
        if (type === 'streaming') {
            activityOptions.url = 'https://twitch.tv/404';
            activityOptions.type = 1;
        } else {
            activityOptions.type = validTypes.indexOf(type);
        }

        try {
            await client.user.setActivity(activityOptions);
            message.channel.send(`✅ Activity set to: ${type} ${name} (${platform})`);
        } catch (error) {
            console.error('Error setting activity:', error);
            message.channel.send('❌ Failed to set activity.');
        }
    }
};