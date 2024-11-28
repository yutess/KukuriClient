const notifier = require('node-notifier');
const fs = require('fs');
const path = require('path');
const Logger = require('./Module/Logger');
const { Login, Prompt } = require('./Module/TokenInit');
const { FileManager } = require('./Module/FileManager');
const { ConfigManager } = require('./Module/Manager');
const Utils = require('./Module/Utils');

const { version: ClientVersion } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"))
const { github: ClientGithub } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"))
const { author } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));

const Creator = author?.name || "Unknown Author";

function Tag() {
    console.log(`
        ██╗  ██╗██╗   ██╗██╗  ██╗██╗   ██╗██████╗ ██╗     ██████╗██╗     ██╗███████╗███╗   ██╗████████╗
        ██║ ██╔╝██║   ██║██║ ██╔╝██║   ██║██╔══██╗██║    ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝
        █████╔╝ ██║   ██║█████╔╝ ██║   ██║██████╔╝██║    ██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║   
        ██╔═██╗ ██║   ██║██╔═██╗ ██║   ██║██╔══██╗██║    ██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║   
        ██║  ██╗╚██████╔╝██║  ██╗╚██████╔╝██║  ██║██║    ╚██████╗███████╗██║███████╗██║ ╚████║   ██║   
        ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝                                                                                      
        `)
    Logger.info(`Made by ${Creator} (${ClientGithub})`);
    Logger.info(`Client version: ${ClientVersion}`)
}

async function main() {
    Tag()
    await Utils.sleep(2000)

    const fileManager = new FileManager();
    const configManager = new ConfigManager();

    const updateChoice = await Prompt.ask('Do you want to run Update? (y/n): ');
    if (updateChoice.toLowerCase() === 'y') {
        Logger.info('Starting Update process...');
        await fileManager.checkMissingFiles();
        await fileManager.installDependencies();
        process.exit(0);
    }

    Utils.clear();
    Tag()
    await Setup(fileManager, configManager);
}

async function Setup(fileManager, configManager) {
    Logger.info('Setup service Started!');

    // Load or create settings config
    const settingsConfig = configManager.getDefaultConfigs().settings;
    settingsConfig.notification = (await Prompt.ask('Enable Desktop Notifications? (y/n): ')).toLowerCase() === 'y';
    settingsConfig.prefix = await Prompt.ask('Set new prefix? (default is .): ');
    settingsConfig.webhook = await Prompt.ask('Enter Discord Webhook URL (optional): ');
    configManager.saveConfig('settings', settingsConfig);

    // Handle login and save token
    try {
        const login = new Login();
        const token = await login.start();
        configManager.saveConfig('token', { token });
    } catch (error) {
        Logger.expection(`Login failed: ${error.message}`);
        return;
    }

    // Save default client config
    configManager.saveConfig('client', configManager.getDefaultConfigs().client);

    // Validate all configs
    if (!configManager.validateConfigs()) {
        Logger.expection('Setup failed due to invalid configurations');
        return;
    }

    notifier.notify({
        title: 'Kukuri Client',
        message: 'Setup Complete!',
        sound: true,
        wait: false
    });


    Logger.load('Setup successfully! All configurations saved');

    // Check and download missing files
    await fileManager.checkMissingFiles();
    
    Logger.warning("Server setup successfully! You can now run Start.js")
}

main().catch(error => {
    Logger.expection(`Something went wrong: ${error.message}`);
});