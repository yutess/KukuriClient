const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'wallet',
    description: 'Manage crypto wallet addresses',
    category: 'Crypto',
    aliases: ['address', 'cryptowallet'],
    cooldown: 5,
    usage: '.wallet [coin] [address]\nExample: .wallet BTC 1abc...',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        const configPath = path.join(__dirname, '../../Config/Config.json');
        let config = require(configPath);

        if (!args[0]) {
            const wallets = config.CryptoSettings.WalletAddresses;
            const walletInfo = [
                '```ml',
                'Crypto Wallet Addresses',
                '=====================',
                ...Object.entries(wallets).map(([coin, address]) => 
                    `${coin}: ${address || 'Not set'}`
                ),
                '```'
            ].join('\n');
            
            return message.channel.send(walletInfo);
        }

        const [coin, address] = args;
        if (!config.CryptoSettings.WalletAddresses.hasOwnProperty(coin.toUpperCase())) {
            return message.channel.send('Invalid cryptocurrency. Supported: BTC, ETH, DOGE');
        }

        config.CryptoSettings.WalletAddresses[coin.toUpperCase()] = address;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        message.channel.send(`✅ Updated ${coin.toUpperCase()} wallet address.`);
    },
};