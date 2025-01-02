const { execSync } = require('child_process');
const fs = require('fs');

const Packages = {
    "@distube/ytdl-core": "4.15.8",
    "axios": "1.7.7",
    "discord.js-selfbot-v13": "3.4.6",
    "express": "4.21.1",
    "node-notifier": "10.0.1",
    "sharp": "0.33.5",
    "systeminformation": "5.23.25",
    "universal-speedtest": "3.0.0",
    "ytdl-core": "4.11.5"
};

function Install() {
    console.log('Checking packages...');
    
    for (const [packageName, version] of Object.entries(Packages)) {
        try {
            require(packageName);
            console.log(`> ${packageName} is already installed`);
        } catch (error) {
            console.log(`+ Installing ${packageName}@${version}...`);
            try {
                execSync(`npm install ${packageName}@${version}`, { stdio: 'inherit' });
                console.log(`- ${packageName} installed successfully`);
            } catch (installError) {
                console.error(`❌ Failed to install ${packageName}: ${installError.message}`);
            }
        }
    }
}

// Run the check and installation
Install();