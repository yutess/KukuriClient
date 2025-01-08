const axios = require('axios');

module.exports = {
    name: 'gains',
    description: 'Show top gainers in different time periods',
    category: 'Crypto',
    aliases: ['topgainers', 'gainer'],
    cooldown: 30,
    usage: '.gains [timeframe]\nExample: .gains 24h',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        const validPeriods = ['1h', '24h', '7d', '30d'];
        const period = args[0]?.toLowerCase() || '24h';

        if (!validPeriods.includes(period)) {
            return message.channel.send(`Invalid period. Use: ${validPeriods.join(', ')}`);
        }

        const periodMap = {
            '1h': 'price_change_percentage_1h_in_currency',
            '24h': 'price_change_percentage_24h',
            '7d': 'price_change_percentage_7d',
            '30d': 'price_change_percentage_30d'
        };

        try {
            const response = await axios.get(
                'https://api.coingecko.com/api/v3/coins/markets', {
                    params: {
                        vs_currency: 'usd',
                        order: periodMap[period],
                        per_page: 10,
                        page: 1,
                        sparkline: false,
                        price_change_percentage: '1h,24h,7d,30d'
                    }
                }
            );

            const gains = response.data
                .filter(coin => coin[periodMap[period]])
                .sort((a, b) => b[periodMap[period]] - a[periodMap[period]]);

            const result = [
                '```ml',
                `Top Gainers (${period})`,
                '=====================',
                ...gains.slice(0, 10).map((coin, index) => 
                    `${index + 1}. ${coin.symbol.toUpperCase().padEnd(8)} $${coin.current_price.toFixed(2).padStart(10)} ${coin[periodMap[period]].toFixed(2).padStart(7)}%`
                ),
                '```'
            ].join('\n');

            message.channel.send(result);
        } catch (error) {
            console.error('Error fetching gainers:', error);
            message.channel.send('Error fetching top gainers. Please try again later.');
        }
    },
};