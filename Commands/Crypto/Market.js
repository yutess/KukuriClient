const axios = require('axios');

module.exports = {
    name: 'market',
    description: 'Get crypto market information',
    category: 'Crypto',
    aliases: ['markets', 'cryptomarket'],
    cooldown: 30,
    usage: '.market',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/global');
            const data = response.data.data;

            const marketInfo = [
                '```ml',
                'Crypto Market Overview',
                '=====================',
                `🌐 Total Market Cap: $${formatNumber(data.total_market_cap.usd)}`,
                `📈 24h Volume: $${formatNumber(data.total_volume.usd)}`,
                `₿ BTC Dominance: ${data.market_cap_percentage.btc.toFixed(2)}%`,
                `🔄 Active Markets: ${formatNumber(data.markets)}`,
                `💱 Active Currencies: ${formatNumber(data.active_cryptocurrencies)}`,
                '```'
            ].join('\n');

            message.channel.send(marketInfo);
        } catch (error) {
            console.error('Error fetching market data:', error);
            message.channel.send('Error fetching market data. Please try again later.');
        }
    },
};

function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(num);
}