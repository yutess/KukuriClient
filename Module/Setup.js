const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const readline = require('readline');

const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const configPath = './Config/Config.json';
let config = {};

async function setup() {
    console.clear();
    console.log('Kukuri Client: Setup\nGitHub: https://github.com/Mikasuru/KukuriClient\n');

    try {
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (err) {
        config = {
            BotSettings: {
                Token: "",
                Prefix: ".",
                BotAdmins: []
            },
            GeneralSettings: {
                OwnerID: "",
                ShowLoadCommands: false
            },
            NotificationSettings: {
                Enabled: true,
                Webhook: ""
            }
        };
    }

    config.BotSettings.Prefix = await askQuestion('Enter bot prefix (default "."): ') || '.';
    config.GeneralSettings.ShowLoadCommands = (await askQuestion('Show command loading messages? (y/n): ')).toLowerCase() === 'y';
    config.NotificationSettings.Enabled = (await askQuestion('Enable notifications? (y/n): ')).toLowerCase() === 'y';

    if (config.NotificationSettings.Enabled) {
        config.NotificationSettings.Webhook = await askQuestion('Enter notification webhook URL: ');
    }

    const loginMethod = await askQuestion('Choose login method:\n1. Put your token manually\n2. Use QR Code to login\nEnter choice (1 or 2): ');

    if (loginMethod === '1') {
        const token = await askQuestion('Enter your Discord token: ');
        config.BotSettings.Token = token;
    } else if (loginMethod === '2') {
        console.log('\nInitiating QR Code login...');
        try {
            const token = await client.QRLogin();
            config.BotSettings.Token = token;
            console.log('QR Code login successful!');
        } catch (error) {
            console.error('QR Code login failed:', error);
            process.exit(1);
        }
    } else {
        console.error('Invalid choice!');
        process.exit(1);
    }

    // Ensure directory exists
    if (!fs.existsSync('./Config')) {
        fs.mkdirSync('./Config', { recursive: true });
    }

    // Save configuration
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    console.log('\n(✅): Configuration saved successfully!');
    process.exit(0);
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

setup().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
});