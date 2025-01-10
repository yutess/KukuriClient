const fs = require('fs');
const path = require('path');
const { WebhookClient } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

class AFKManager {
    constructor() {
        this.configPath = path.join(__dirname, '..', '..', 'Config', 'Config.json');
        this.config = require(this.configPath);
        this.isAfk = false;
        this.startTime = null;
        this.reason = '';
        this.recentResponses = new Map(); // Map
    }

    toggleAFK(reason = '') {
        this.isAfk = !this.isAfk;
        if (this.isAfk) {
            this.startTime = Date.now();
            this.reason = reason;
        } else {
            this.startTime = null;
            this.reason = '';
            this.recentResponses.clear(); // Clear when disable AFK
        }
        
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

    formatResponse() {
        const randomResponse = this.getRandomResponse();
        const duration = this.getAfkDuration();
        const components = [randomResponse];
        
        if (this.reason) {
            components.push(`Reason: ${this.reason}`);
        }
        components.push(`-# AFK duration: ${duration} ago`);
        
        return components.join('\n');
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
                '```'
            ].join('\n');

            await webhook.send({ content });
        } catch (error) {
            Logger.expection(`Failed to send webhook notification: ${error.message}`);
        }
    }

    shouldRespond(userId, channelId) { // Check for reply
        const key = `${userId}-${channelId}`;
        const now = Date.now();
        const lastResponse = this.recentResponses.get(key);

        if (!lastResponse || (now - lastResponse) > 60000) { // If doesnt reply or reply 1 min ago
            this.recentResponses.set(key, now);
            return true;
        }

        return false;
    }
}

const manager = new AFKManager();

module.exports = {
    name: 'afk',
    description: 'Toggle AFK mode with optional reason',
    category: 'General',
    execute(message, args, client) {
        const reason = args.join(' ');
        manager.toggleAFK(reason);

        const status = manager.isAfk ? 'enabled' : 'disabled';
        const reasonText = reason ? ` with reason: ${reason}` : '';
        message.channel.send(`AFK mode has been ${status}${reasonText}`);
    },
    init(client) {
        client.on('messageCreate', async (message) => {
            if (!manager.isAfk) return;
            if (message.author.id === client.user.id) return;
            if (message.content.includes('@everyone') || message.content.includes('@here')) return;

            if (message.channel.type === 'DM' || message.mentions.users.has(client.user.id)) { // Check if mentioned or DM
                if (!manager.shouldRespond(message.author.id, message.channel.id)) return; // Check for reply

                const response = manager.formatResponse();

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