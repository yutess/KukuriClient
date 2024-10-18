// Setup Service
const notifier = require('node-notifier');
const fs = require('fs');
const path = require('path');

const { Logger, Prompt } = require('./Module/Logger');
const { Manager } = require('./Module/Manager');

const CONFIG_FOLDER = 'Config';

async function Setup() {
    Logger('INFO', 'Setup service Started!');

    if (!fs.existsSync(CONFIG_FOLDER)) {
        fs.mkdirSync(CONFIG_FOLDER);
    }

    // Settings.json
    const settingsConfig = {
        notification: false,
        prefix: '.',
        webhook: ''
    };
    settingsConfig.notification = (await Prompt('Enable the Desktop Notification? (y/n): ')).toLowerCase() === 'y';
    settingsConfig.prefix = await Prompt('Do you want to set the new prefix? (default is .): ');
    fs.writeFileSync(path.join(CONFIG_FOLDER, 'Settings.json'), JSON.stringify(settingsConfig, null, 2));

    // Token.json
    const tokenConfig = { token: '' };
    tokenConfig.token = await Prompt('Please enter your user token: ');
    fs.writeFileSync(path.join(CONFIG_FOLDER, 'Token.json'), JSON.stringify(tokenConfig, null, 2));

    notifier.notify({
      title: 'Kukuri Client',
      message: `Setup Complete!`,
      sound: true,
      wait: false
    });

    Logger('SUCCESS', 'Setup successfully! Wrote all config in the Config Folder');
    await Manager();
}

Setup().catch(error => {
    Logger('ERROR', `Something went wrong while setup: ${error.message}`);
});