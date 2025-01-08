module.exports = {
    name: 'stoprpc',
    description: 'Stop all RPC activities',
    category: 'Misc',
    execute: async (message, args, client) => {
        try {
            await client.user.setPresence({ activities: [] });
            message.channel.send('✅ Cleared all RPC activities successfully!');
        } catch (error) {
            message.channel.send(`❌ Error: ${error.message}`);
        }
    }
};