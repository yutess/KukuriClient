const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'ping',
    description: 'Check bot\'s performance metrics',
    category: 'General',
    async execute(message, args, client) {
        const sent = await message.channel.send('Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        
        const embed = new WebEmbed()
            .setTitle('🏓 Ping Statistics')
            .setURL('https://github.com/Mikasuru/KukuriClient')
            .setDescription(`📡 Latency: ${latency}ms\n🤖 API Latency: ${Math.round(client.ws.ping)}ms`)
            .setColor('#00ff00')
            .setProvider({ name: '🟢 Bot Status: Online', url: 'https://github.com/Mikasuru/KukuriClient' })
            .setAuthor({ name: 'Kukuri Client', url: 'https://github.com/Mikasuru/KukuriClient' });

        sent.delete();
        message.channel.send({
            content: `Pong! ${WebEmbed.hiddenEmbed}${embed}`,
        });
    },
};