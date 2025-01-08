const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const Utils = require('../../Module/Utils');

module.exports = {
    name: 'portfolio',
    description: 'Track your crypto portfolio',
    category: 'Crypto',
    aliases: ['port', 'holdings'],
    cooldown: 5,
    usage: '.portfolio [add/remove] [coin] [amount]\nExample: .portfolio add bitcoin 0.1',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        const portfolioPath = path.join(__dirname, '../../data/portfolio.json');
        let portfolio = [];

        try {
            const data = await fs.readFile(portfolioPath, 'utf8');
            portfolio = JSON.parse(data);
        } catch (error) {
            // Start with empty portfolio
        }

        if (!args[0]) {
            if (portfolio.length === 0) {
                return message.channel.send('Your portfolio is empty. Use .portfolio add <coin> <amount> to add holdings.');
            }

            // Calculate current value of all holdings
            let total = 0;
            const holdings = [];

            for (const item of portfolio) {
                try {
                    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${item.coin}&vs_currencies=usd`);
                    const price = response.data[item.coin].usd;
                    const value = price * item.amount;
                    total += value;
                    holdings.push({
                        coin: item.coin.toUpperCase(),
                        amount: item.amount,
                        value: value
                    });
                } catch (error) {
                    console.error(`Error fetching price for ${item.coin}:`, error);
                }
            }

            const portfolioInfo = [
                '```ml',
                'Your Crypto Portfolio',
                '=====================',
                ...holdings.map(h => 
                    `${h.coin}: ${h.amount} (${((h.value/total)*100).toFixed(2)}%) = $${h.value.toLocaleString()}`
                ),
                '---------------------',
                `Total Value: $${total.toLocaleString()}`,
                '```'
            ].join('\n');

            // Add distribution chart
            const chartData = holdings.map(h => ({
                name: h.coin,
                value: h.value
            }));
            const distributionChart = Utils.createPortfolioChart(chartData);

            await message.channel.send(portfolioInfo);
            return message.channel.send(distributionChart);
        }

        const [action, coin, amount] = args;

        if (action === 'add') {
            if (!coin || !amount || isNaN(amount)) {
                return message.channel.send('Usage: .portfolio add <coin> <amount>');
            }

            try {
                // Verify the coin exists on CoinGecko
                await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.toLowerCase()}&vs_currencies=usd`);
                
                portfolio.push({
                    coin: coin.toLowerCase(),
                    amount: parseFloat(amount)
                });

                await fs.writeFile(portfolioPath, JSON.stringify(portfolio, null, 2));
                message.channel.send(`✅ Added ${amount} ${coin.toUpperCase()} to your portfolio.`);
            } catch (error) {
                message.channel.send('Invalid coin ID. Please check the coin name on CoinGecko.');
            }
        } else if (action === 'remove') {
            if (!coin) {
                return message.channel.send('Usage: .portfolio remove <coin>');
            }

            const index = portfolio.findIndex(p => p.coin.toLowerCase() === coin.toLowerCase());
            if (index === -1) {
                return message.channel.send('Coin not found in your portfolio.');
            }

            portfolio.splice(index, 1);
            await fs.writeFile(portfolioPath, JSON.stringify(portfolio, null, 2));
            message.channel.send(`✅ Removed ${coin.toUpperCase()} from your portfolio.`);
        }
    },
};