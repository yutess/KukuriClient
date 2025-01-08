const axios = require('axios');

module.exports = {
    name: 'convert',
    description: 'Convert between cryptocurrencies',
    category: 'Crypto',
    aliases: ['conv', 'cryptoconvert'],
    cooldown: 3,
    usage: '.convert [amount] [from] [to]\nExample: .convert 1 bitcoin litecoin',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (args.length !== 3) {
            return message.channel.send('Usage: .convert [amount] [from] [to]\nExample: .convert 1 bitcoin litecoin');
        }

        const [amount, fromCoin, toCoin] = args;
        if (isNaN(amount)) {
            return message.channel.send('Please provide a valid amount.');
        }

        try {
            // Get conversion rates
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoin.toLowerCase()},${toCoin.toLowerCase()}&vs_currencies=usd`
            );

            if (!response.data[fromCoin.toLowerCase()] || !response.data[toCoin.toLowerCase()]) {
                return message.channel.send('One or both coins not found. Please check the coin IDs.');
            }

            const fromPrice = response.data[fromCoin.toLowerCase()].usd;
            const toPrice = response.data[toCoin.toLowerCase()].usd;
            const convertedAmount = (amount * fromPrice) / toPrice;

            const result = [
                '```ml',
                'Crypto Conversion',
                '=====================',
                `From: ${amount} ${fromCoin.toUpperCase()} ($${(amount * fromPrice).toLocaleString()})`,
                `To: ${convertedAmount.toFixed(8)} ${toCoin.toUpperCase()} ($${(amount * fromPrice).toLocaleString()})`,
                `Rate: 1 ${fromCoin.toUpperCase()} = ${(fromPrice/toPrice).toFixed(8)} ${toCoin.toUpperCase()}`,
                '```'
            ].join('\n');

            message.channel.send(result);
        } catch (error) {
            console.error('Error converting currencies:', error);
            message.channel.send('Error converting currencies. Please check the coin IDs and try again.');
        }
    },
}