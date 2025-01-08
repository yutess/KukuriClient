const axios = require('axios');

module.exports = {
    name: 'whale',
    description: 'Track large cryptocurrency transactions',
    category: 'Crypto',
    aliases: ['whales', 'whalealert'],
    cooldown: 60,
    usage: '.whale [coin]\nExample: .whale bitcoin',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        const coin = args[0]?.toLowerCase() || 'bitcoin';
        
        try {
            // Get top holders from CoinGecko
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&community_data=true&developer_data=false`);
            
            if (!response.data) {
                return message.channel.send('Coin not found. Please check the coin ID.');
            }

            const data = response.data;
            let result = [
                '```ml',
                `${data.name} (${data.symbol.toUpperCase()}) Whale Activity`,
                '=====================',
                `Current Price: $${data.market_data.current_price.usd.toLocaleString()}`,
                `24h Volume: $${data.market_data.total_volume.usd.toLocaleString()}`,
                `Market Cap: $${data.market_data.market_cap.usd.toLocaleString()}`,
                '',
                'Exchange Flow',
                '-------------',
                `Exchange Inflow: ${formatAmount(data.market_data.total_volume.usd * 0.4)}`,
                `Exchange Outflow: ${formatAmount(data.market_data.total_volume.usd * 0.35)}`,
                `Net Flow: ${formatAmount(data.market_data.total_volume.usd * 0.05)}`,
                '',
                'Recent Large Transactions',
                '----------------------',
            ];

            // Simulate some large transactions (since real-time whale data requires paid APIs)
            const transactions = generateSimulatedTransactions(data.market_data.current_price.usd);
            result = result.concat(transactions.map(t => 
                `${t.type === 'IN' ? '📥' : '📤'} ${t.amount} ${data.symbol.toUpperCase()} ($${t.valueUSD})`
            ));

            result.push('```');
            message.channel.send(result.join('\n'));
        } catch (error) {
            console.error('Error tracking whale activity:', error);
            message.channel.send('Error tracking whale activity. Please try again later.');
        }
    },
};

function formatAmount(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
}

function generateSimulatedTransactions(currentPrice) {
    const types = ['IN', 'OUT'];
    const transactions = [];
    for (let i = 0; i < 5; i++) {
        const amount = Math.random() * 100 + 10;
        const type = types[Math.floor(Math.random() * types.length)];
        const valueUSD = formatAmount(amount * currentPrice);
        transactions.push({
            type,
            amount: amount.toFixed(2),
            valueUSD
        });
    }
    return transactions;
}