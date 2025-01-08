const path = require('path');
const fs = require('fs').promises;
const notifier = require('node-notifier');

module.exports = {
    name: 'alert',
    description: 'Set price alerts for cryptocurrencies',
    category: 'Crypto',
    aliases: ['setalert', 'pricealert'],
    cooldown: 5,
    usage: '.alert <coin> <condition> <price>\nExample: .alert bitcoin > 50000',
    permissions: ['SEND_MESSAGES'],
    alertChecks: new Map(),
    execute: async (message, args, client) => {
        if (!args[0] || !args[1] || !args[2]) {
            return message.channel.send('Usage: .alert <coin> <condition> <price>\nExample: .alert bitcoin > 50000');
        }

        const [coin, condition, price] = args;
        if (!['>', '<'].includes(condition)) {
            return message.channel.send('Invalid condition. Use > for above or < for below.');
        }

        const alertsPath = path.join(__dirname, '../../data/cryptoAlerts.json');
        let alerts = [];

        try {
            const data = await fs.readFile(alertsPath, 'utf8');
            alerts = JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is invalid, start with empty array
        }

        const newAlert = {
            id: Date.now(),
            coin: coin.toLowerCase(),
            condition,
            price: parseFloat(price),
            userId: message.author.id
        };

        alerts.push(newAlert);
        await fs.writeFile(alertsPath, JSON.stringify(alerts, null, 2));

        // Start checking price for this alert
        this.startPriceCheck(newAlert, client);

        message.channel.send(`✅ Alert set for ${coin} ${condition} $${price}`);
    },

    async startPriceCheck(alert, client) {
        if (this.alertChecks.has(alert.id)) return;

        const checkInterval = setInterval(async () => {
            try {
                const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${alert.coin}&vs_currencies=usd`);
                const currentPrice = response.data[alert.coin].usd;

                const conditionMet = alert.condition === '>' 
                    ? currentPrice > alert.price
                    : currentPrice < alert.price;

                if (conditionMet) {
                    // Alert the user
                    const user = await client.users.fetch(alert.userId);
                    const alertMessage = `🚨 Alert: ${alert.coin} is now ${alert.condition} $${alert.price} (Current: $${currentPrice})`;
                    
                    user.send(alertMessage);
                    notifier.notify({
                        title: 'Crypto Alert',
                        message: alertMessage,
                        sound: true
                    });

                    // Remove the alert
                    clearInterval(checkInterval);
                    this.alertChecks.delete(alert.id);
                    
                    // Update alerts file
                    const alertsPath = path.join(__dirname, '../../data/cryptoAlerts.json');
                    const alerts = JSON.parse(await fs.readFile(alertsPath, 'utf8'));
                    const updatedAlerts = alerts.filter(a => a.id !== alert.id);
                    await fs.writeFile(alertsPath, JSON.stringify(updatedAlerts, null, 2));
                }
            } catch (error) {
                console.error('Error checking price alert:', error);
            }
        }, 60000); // Check every minute

        this.alertChecks.set(alert.id, checkInterval);
    },

    // Initialize alerts when bot starts
    async onReady(client) {
        const alertsPath = path.join(__dirname, '../../data/cryptoAlerts.json');
        try {
            const data = await fs.readFile(alertsPath, 'utf8');
            const alerts = JSON.parse(data);
            alerts.forEach(alert => this.startPriceCheck(alert, client));
        } catch (error) {
            // No alerts file exists yet
        }
    }
};