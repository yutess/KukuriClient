module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency',
    execute(message, args, client) {
        const latency = Date.now() - message.createdTimestamp;
        message.reply(`Pong, Latency is ${latency}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    },
};