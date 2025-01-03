module.exports = {
    name: 'stoprpc',
    description: 'Stop all RPC activities',
    async execute(message, args, client) {
        try {
            await client.user.setPresence({ activities: [] });
            message.reply('✅ Cleared all RPC activities successfully!');
        } catch (error) {
            message.reply(`❌ Error: ${error.message}`);
        }
    }
};