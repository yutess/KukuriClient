const axios = require('axios');

module.exports = {
    name: 'price',
    description: 'Get cryptocurrency price information',
    category: 'Crypto',
    aliases: ['p', 'cryptoprice'],
    cooldown: 3,
    usage: '.price <coin>\nExample: .price bitcoin',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (!args[0]) {
            return message.channel.send('Please specify a cryptocurrency. Example: .price bitcoin');
        }

        try {
            const coin = args[0].toLowerCase();
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,eur&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
            
            if (!response.data[coin]) {
                return message.channel.send('Cryptocurrency not found. Please check the name and try again.');
            }

            const data = response.data[coin];
            const priceInfo = [
                '```ml',
                `${coin.toUpperCase()} Price Information`,
                '=====================',
                `💰 USD: $${data.usd.toLocaleString()}`,
                `💶 EUR: €${data.eur.toLocaleString()}`,
                `📈 24h Change: ${data.usd_24h_change.toFixed(2)}%`,
                `📊 Market Cap: $${data.usd_market_cap.toLocaleString()}`,
                `🔄 24h Volume: $${data.usd_24h_vol.toLocaleString()}`,
                '```'
            ].join('\n');

            message.channel.send(priceInfo);
        } catch (error) {
            console.error('Error fetching crypto price:', error);
            message.channel.send('Error fetching cryptocurrency price. Please try again later.');
        }
    },
};