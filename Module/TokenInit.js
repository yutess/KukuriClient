const readline = require('readline');
const { Client } = require('discord.js-selfbot-v13');
const Logger = require('./Logger');

// Create a class for handling prompts
class Prompt {
    static async ask(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}

class Login {
    constructor() {
        this.client = new Client({ checkUpdate: false });
        this.timeoutDuration = 10 * 60 * 1000; // 10 minutes
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    getTimeoutInfo() {
        const now = new Date();
        const timeoutAt = new Date(now.getTime() + this.timeoutDuration);
        return {
            start: this.formatTime(now),
            end: this.formatTime(timeoutAt)
        };
    }

    async manualLogin() {
        try {
            const token = await Prompt.ask('Please enter your Discord token: ');
            return token;
        } catch (error) {
            Logger.expection(`Manual login failed: ${error.message}`);
            throw error;
        }
    }

    async qrLogin() {
        return new Promise((resolve, reject) => {
            try {
                const timeInfo = this.getTimeoutInfo();
                Logger.info('Generating QR Code login...');
                Logger.info(`QR Code will expire at ${timeInfo.end} (${this.timeoutDuration/60000} minutes from ${timeInfo.start})`);

                // Set timeout
                const timeoutId = setTimeout(() => {
                    this.client.destroy();
                    reject(new Error('QR Code scan timeout. Please try again.'));
                }, this.timeoutDuration);

                this.client.QRLogin()
                    .then(ticket => {
                        clearTimeout(timeoutId);
                        Logger.info('Successfully obtained token!');
                        resolve(ticket);
                    })
                    .catch(error => {
                        clearTimeout(timeoutId);
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    async start() {
        console.log('\nChoose login method:');
        console.log('1. Enter Token manually');
        console.log('2. Scan QR Code');
        
        const choice = await Prompt.ask('Select option (1 or 2): ');
        
        try {
            switch (choice) {
                case '1':
                    return await this.manualLogin();
                case '2':
                    return await this.qrLogin();
                default:
                    Logger.expection('Invalid option selected');
                    throw new Error('Invalid option');
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = {
    Login,
    Prompt
};