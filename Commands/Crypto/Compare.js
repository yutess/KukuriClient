const axios = require('axios');
const Utils = require('../../Module/Utils');

module.exports = {
    name: 'compare',
    description: 'Compare multiple cryptocurrencies',
    category: 'Crypto',
    aliases: ['comp', 'comparecoin'],
    cooldown: 10,
    usage: '.compare <coin1> <coin2> [coin3...]\nExample: .compare bitcoin ethereum',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (args.length < 2) {
            return message.channel.send('Usage: .compare <coin1> <coin2> [coin3...]\nExample: .compare bitcoin ethereum');
        }

        try {
            // Get detailed data for each coin
            const coins = args.map(arg => arg.toLowerCase());
            const responses = await Promise.all(
                coins.map(coin => 
                    axios.get(`https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`)
                )
            );

            const coinData = responses.map(response => response.data);

            // Generate comparison tables
            const marketComparison = [
                '```ml',
                'Market Metrics Comparison',
                '=========================',
                'Metric'.padEnd(20) + coins.map(c => c.toUpperCase().padStart(15)).join(''),
                '-'.repeat(20 + coins.length * 15),
                'Price ($)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.current_price.usd, 2).padStart(15)).join(''),
                'Market Cap ($)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.market_cap.usd, 0).padStart(15)).join(''),
                'Volume 24h ($)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.total_volume.usd, 0).padStart(15)).join(''),
                'Change 24h (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.price_change_percentage_24h, 2).padStart(15)).join(''),
                'ATH ($)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.ath.usd, 2).padStart(15)).join(''),
                'ATH Change (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.ath_change_percentage.usd, 2).padStart(15)).join(''),
                '```'
            ].join('\n');

            const performanceComparison = [
                '```ml',
                'Performance Comparison',
                '======================',
                'Period'.padEnd(20) + coins.map(c => c.toUpperCase().padStart(15)).join(''),
                '-'.repeat(20 + coins.length * 15),
                '1h (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.price_change_percentage_1h_in_currency?.usd || 0, 2).padStart(15)).join(''),
                '24h (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.price_change_percentage_24h, 2).padStart(15)).join(''),
                '7d (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.price_change_percentage_7d, 2).padStart(15)).join(''),
                '30d (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.price_change_percentage_30d, 2).padStart(15)).join(''),
                '1y (%)'.padEnd(20) + coinData.map(d => formatNumber(d.market_data.price_change_percentage_1y, 2).padStart(15)).join(''),
                '```'
            ].join('\n');

            const additionalMetrics = [
                '```ml',
                'Additional Metrics',
                '==================',
                'Metric'.padEnd(20) + coins.map(c => c.toUpperCase().padStart(15)).join(''),
                '-'.repeat(20 + coins.length * 15),
                'Market Cap Rank'.padEnd(20) + coinData.map(d => d.market_cap_rank.toString().padStart(15)).join(''),
                'Listed Count'.padEnd(20) + coinData.map(d => d.tickers?.length.toString().padStart(15) || ''.padStart(15)).join(''),
                'Reddit Users'.padEnd(20) + coinData.map(d => (d.community_data.reddit_subscribers || 0).toString().padStart(15)).join(''),
                'Twitter Follows'.padEnd(20) + coinData.map(d => (d.community_data.twitter_followers || 0).toString().padStart(15)).join(''),
                'Dev Commits 4w'.padEnd(20) + coinData.map(d => (d.developer_data?.commit_count_4_weeks || 0).toString().padStart(15)).join(''),
                '```'
            ].join('\n');

            await message.channel.send(marketComparison);
            await message.channel.send(performanceComparison);
            await message.channel.send(additionalMetrics);

        } catch (error) {
            console.error('Error comparing coins:', error);
            message.channel.send('Error comparing coins. Please check the coin IDs and try again.');
        }
    },
};

function formatNumber(num, decimals = 2) {
    if (num === undefined || num === null) return 'N/A';
    
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
    
    return num.toFixed(decimals);
}