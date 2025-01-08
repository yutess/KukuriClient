// Commands/Crypto/History.js
const axios = require('axios');
const Utils = require('../../Module/Utils');

module.exports = {
    name: 'history',
    description: 'Get price history for a cryptocurrency',
    category: 'Crypto',
    aliases: ['hist', 'pricehistory'],
    cooldown: 10,
    usage: '.history <coin> [days=30]\nExample: .history bitcoin 7',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (!args[0]) {
            return message.channel.send('Usage: .history <coin> [days=30]');
        }

        const coin = args[0].toLowerCase();
        const days = parseInt(args[1]) || 30;

        if (days > 365) {
            return message.channel.send('Maximum period is 365 days.');
        }

        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
            );

            const prices = response.data.prices;
            const priceHistory = prices.map(p => ({
                date: new Date(p[0]).toLocaleDateString(),
                price: p[1]
            }));

            // Create text info
            const historyInfo = [
                '```ml',
                `${coin.toUpperCase()} Price History (${days} days)`,
                '=====================',
                `Earliest: $${priceHistory[0].price.toLocaleString()} (${priceHistory[0].date})`,
                `Latest: $${priceHistory[priceHistory.length-1].price.toLocaleString()} (${priceHistory[priceHistory.length-1].date})`,
                `Change: ${((priceHistory[priceHistory.length-1].price - priceHistory[0].price) / priceHistory[0].price * 100).toFixed(2)}%`,
                '```'
            ].join('\n');

            // Create price chart
            const chart = Utils.createPriceChart(priceHistory, {
                title: `${coin.toUpperCase()} Price Chart (${days} days)`,
                height: 15,
                width: 50
            });

            await message.channel.send(historyInfo);
            await message.channel.send(chart);

        } catch (error) {
            console.error('Error fetching price history:', error);
            message.channel.send('Error fetching price history. Please check the coin name and try again.');
        }
    },
};