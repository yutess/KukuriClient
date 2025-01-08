const fs = require('fs').promises;
const path = require('path');
const { WebEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../../Module/Logger');

const autoReacts = new Map();
const dataPath = path.join(__dirname, '../../data/autoreact.json');

function createMessageListener(client) {
    return async (msg) => {
        try {
            if (autoReacts.size === 0) return;
            
            for (const [id, react] of autoReacts.entries()) {
                if (react.isGlobal || msg.author.id === react.userId) {
                    try {
                        await msg.react(react.emoji);
                        Logger.info(`Auto reacted with ${react.emoji} to message from ${msg.author.tag}`);
                    } catch (error) {
                        Logger.expection(`Failed to auto-react: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            Logger.expection(`Error in messageListener: ${error.message}`);
        }
    };
}

// เพิ่มฟังก์ชัน initialize
async function initialize(client) {
    await loadAutoReacts();
    client.on('messageCreate', createMessageListener(client));
}

async function loadAutoReacts() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const saved = JSON.parse(data);
        saved.forEach(react => {
            autoReacts.set(react.id, {
                userId: react.userId,
                emoji: react.emoji,
                isGlobal: react.isGlobal
            });
        });
    } catch (error) {
        // If file doesn't exist, create it
        if (error.code === 'ENOENT') {
            await fs.writeFile(dataPath, '[]');
        } else {
            Logger.expection('Failed to load auto-reacts:', error);
        }
    }
}

// Save auto-reacts to file
async function saveAutoReacts() {
    try {
        const data = Array.from(autoReacts.entries()).map(([id, react]) => ({
            id,
            userId: react.userId,
            emoji: react.emoji,
            isGlobal: react.isGlobal
        }));
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
        Logger.expection('Failed to save auto-reacts:', error);
    }
}

module.exports = {
    name: 'autoreact', 
    description: 'Auto react to messages from specific users',
    category: 'Misc',
    aliases: ['autoemote', 'autoresponse'],
    cooldown: 5,
    usage: '.autoreact <@user / userid / all> <emoji>',
    permissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    async onReady(client) {
        await initialize(client);
    },
    execute: async (message, args, client) => {
        // Load existing auto-reacts if not loaded
        if (autoReacts.size === 0) {
            await loadAutoReacts();
        }

        // Sub-commands
        if (args[0] === 'list') {
            return this.listAutoReacts(message);
        }

        if (args[0] === 'stop') {
            if (!args[1]) return message.channel.send('Please provide the auto-react ID to stop.');
            return this.stopAutoReact(message, args[1]);
        }

        if (args.length < 2) {
            return message.channel.send('Usage:\nautoreact <@user / userid / all> <emoji>\nautoreact stop <id>');
        }

        // Get target user or check if global
        let targetUser = null;
        let isGlobal = false;

        if (args[0].toLowerCase() === 'all') {
            isGlobal = true;
        } else {
            if (message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            } else {
                try {
                    targetUser = await client.users.fetch(args[0]);
                } catch (error) {
                    return message.channel.send('Invalid user ID or mention.');
                }
            }
        }

        const emoji = args[1];

        // Test emoji validity by trying to react to the command message
        try {
            await message.react(emoji);
            await message.reactions.cache.get(emoji)?.remove();
        } catch (error) {
            return message.channel.send('Invalid emoji. Please provide a valid emoji.');
        }

        const autoReactId = Date.now().toString();

        autoReacts.set(autoReactId, {
            userId: isGlobal ? 'all' : targetUser.id,
            emoji,
            isGlobal
        });

        await saveAutoReacts();

        // Send confirmation
        const embed = new WebEmbed()
            .setTitle('Auto-React Setup')
            .setColor('#00FF00')
            .setDescription([
                `ID: ${autoReactId}`,
                `Target: ${isGlobal ? 'All Users' : targetUser.tag}`,
                `Emoji: ${emoji}`,
                '',
                'Commands:',
                '.autoreact list - Show all active auto-reacts',
                '.autoreact stop <id> - Stop a specific auto-react'
            ].join('\n'));

        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
    },

    async listAutoReacts(message) {
        if (autoReacts.size === 0) {
            return message.channel.send('No active auto-reacts.');
        }

        const embed = new WebEmbed()
            .setTitle('Active Auto-Reacts')
            .setColor('#00FF00');

        const description = Array.from(autoReacts.entries())
            .map(([id, react]) => {
                const target = react.isGlobal ? 'All Users' : 
                    message.client.users.cache.get(react.userId)?.tag || react.userId;
                return `ID: ${id}\nTarget: ${target}\nEmoji: ${react.emoji}\n`;
            })
            .join('\n');

        embed.setDescription(description);
        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
    },

    async stopAutoReact(message, id) {
        if (!autoReacts.has(id)) {
            return message.channel.send('Invalid auto-react ID.');
        }

        const react = autoReacts.get(id);
        autoReacts.delete(id);
        await saveAutoReacts();

        const embed = new WebEmbed()
            .setTitle('Auto-React Stopped')
            .setColor('#FF0000')
            .setDescription([
                `ID: ${id}`,
                `Target: ${react.isGlobal ? 'All Users' : message.client.users.cache.get(react.userId)?.tag || react.userId}`,
                `Emoji: ${react.emoji}`
            ].join('\n'));

        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
    }
};