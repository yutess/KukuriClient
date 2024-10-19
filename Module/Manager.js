const fs = require('fs');
const path = require('path');
const axios = require('axios');
const notifier = require('node-notifier');

const { Logger } = require('./Logger');

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Mikasuru/KukuriClient/main/';
const REQUIRED_FILES = [
    'Commands/AFK.js',
    'Commands/Avatar.js',
    'Commands/Calculate.js',
    'Commands/Clean.js',
    'Commands/FakeYoutube.js',
    'Commands/Help.js',
    'Commands/Ping.js',
    'Commands/Poll.js',
    'Commands/Purge.js',
    'Commands/RPC.js',
    'Commands/SampleEmbed.js',
    'Commands/ServerInfo.js',
    'Commands/UserInfo.js',
    'Commands/VoiceMessage.js',
    'Config/Client.json',
    'Config/Settings.json',
    'Config/Token.json',
    'Module/Logger.js',
    'Module/Manager.js',
    'Main.js'
];

async function downloadFile(filePath) {
    const url = GITHUB_RAW_URL + filePath;
    const localPath = path.join(__dirname, '..', filePath);

    try {
        const response = await axios.get(url);
        fs.writeFileSync(localPath, response.data);
        Logger('SUCCESS', `Downloading ${filePath} successfully!`);
    } catch (error) {
        Logger('ERROR', `Couldn't download ${filePath}: ${error.message}. Make sure to crate the folder first!`);
    }
}

async function checkMissingFiles() {
    Logger('INFO', 'Checking all missing files...');

    for (const file of REQUIRED_FILES) {
        const filePath = path.join(__dirname, '..', file);
        if (!fs.existsSync(filePath)) {
            Logger('WARNING', `${file} is Missing! Attemping to download...`);
            await downloadFile(file);
        }
    }

    notifier.notify({
        title: 'Kukuri Client',
        message: `Checking completed!`,
        sound: true,
        wait: false
      });
    Logger('SUCCESS', 'The service is finished! Attemping to run Main.js');
}

async function runMain() {
    try {
        Logger('INFO', 'Starting Main.js');
        require('../Main.js');
    } catch (error) {
        Logger('ERROR', `Error while starting Main.js: ${error.message}`);
    }
}

async function Manager() {
    await checkMissingFiles();
    await runMain();
}

module.exports = { Manager };
