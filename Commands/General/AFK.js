const fs = require('fs');
const path = require('path');
const { WebhookClient } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

// Better handling than before
class AFKManager {
    constructor() {
        this.configPath = path.join(__dirname, '..', '..', 'Config', 'Config.json');
        this.config = require(this.configPath);
        this.isAfk = false;
        this.startTime = null;
        this.reason = '';
    }

    toggleAFK(reason = '') {
        this.isAfk = !this.isAfk;
        if (this.isAfk) {
            this.startTime = Date.now();
            this.reason = reason;
        } else {
            this.startTime = null;
            this.reason = '';
        }
        
        // Update config
        this.config.Commands.AFK.afk = this.isAfk;
        this.config.Commands.AFK.reason = this.reason;
        this.config.Commands.AFK.startTime = this.startTime;
        
        this.saveConfig();
    }

    getAfkDuration() {
        if (!this.startTime) return '';
        const duration = Date.now() - this.startTime;
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    getRandomResponse() {
        const responses = this.config.Commands.AFK.afkKeywords;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            Logger.expection(`Failed to save AFK config: ${error.message}`);
        }
    }

    async sendWebhookNotification(message, response) {
        if (!this.config.NotificationSettings.Enabled || !this.config.NotificationSettings.Webhook) return;

        try {
            const webhook = new WebhookClient({ url: this.config.NotificationSettings.Webhook });
            const content = [
                '```',
                'AFK Notification',
                '================',
                `From: ${message.author.tag}`,
                `Channel: ${message.channel.type === 'DM' ? 'Direct Message' : message.channel.name}`,
                `Message: ${message.content}`,
                `Response: ${response}`,
                `AFK Duration: ${this.getAfkDuration()}`,
                this.reason ? `AFK Reason: ${this.reason}` : '',
                '```'
            ].filter(Boolean).join('\n');

            await webhook.send({ content });
        } catch (error) {
            Logger.expection(`Failed to send webhook notification: ${error.message}`);
        }
    }
}

const manager = new AFKManager();

module.exports = {
    name: 'afk',
    description: 'Toggle AFK mode with optional reason',
    category: 'General',
    usage: '.afk | .afk [reason]',
    execute(message, args, client) {
        const reason = args.join(' ');
        manager.toggleAFK(reason);

        const status = manager.isAfk ? 'enabled' : 'disabled';
        const reasonText = reason ? ` with reason: ${reason}` : '';
        message.channel.send(`AFK mode has been ${status}${reasonText}.`);
    },
    init(client) {
        client.on('messageCreate', async (message) => {
            if (!manager.isAfk) return;
            if (message.author.id === client.user.id) return;
            if (message.content.includes('@everyone') || message.content.includes('@here')) return;

            // Check if mentioned or DM
            if (message.channel.type === 'DM' || message.mentions.users.has(client.user.id)) {
                const response = [
                    manager.getRandomResponse(),
                    `\n-# AFK for: ${manager.getAfkDuration()} ago`,
                    manager.reason ? `\nReason: ${manager.reason}` : ''
                ].filter(Boolean).join('');

                try {
                    await message.channel.send(response);
                    await manager.sendWebhookNotification(message, response);
                } catch (error) {
                    Logger.expection(`Failed to send AFK response: ${error.message}`);
                }
            }
        });
    }
};
