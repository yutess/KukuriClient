const express = require('express');
const path = require('path');
const { Client, RichPresence } = require('discord.js-selfbot-v13');
const fs = require('fs');
const WebSocket = require('ws');
const server = require('http').createServer();
const Logger = require('../Module/Logger');

const app = express();
const wss = new WebSocket.Server({ server });
const port = 3000;

// Discord client
let client = null;
let TOKEN = '';

let activeChannel = null;
const connections = new Set();

// Load Token from Config
try {
    const tokenConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../Config/Token.json')));
    TOKEN = tokenConfig.token;
} catch (error) {
    Logger.expection('Error loading token:', error);
}

// WebSocket connections
wss.on('connection', (ws) => {
    connections.add(ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'watchChannel') {
            activeChannel = data.channelId;
        } else if (data.type === 'startBot') {
            startBot();
        } else if (data.type === 'stopBot') {
            stopBot();
        }
    });

    ws.on('close', () => {
        connections.delete(ws);
    });
});

async function updateRichPresence(client, config) {
    if (!client || !config.rpc?.enabled) {
        client.user.setActivity(null);
        return;
    }

    try {
        const rpc = new RichPresence(client)
            .setApplicationId(config.rpc.applicationId)
            .setName(config.rpc.name)
            .setType(config.rpc.type || 'PLAYING');

        if (config.rpc.url) {
            rpc.setURL(config.rpc.url);
        }

        // Set basic info
        if (config.rpc.details) rpc.setDetails(config.rpc.details);
        if (config.rpc.state) rpc.setState(config.rpc.state);

        if (config.rpc.partyCurrent && config.rpc.partyMax) {
            rpc.setParty({
                max: parseInt(config.rpc.partyMax),
                current: parseInt(config.rpc.partyCurrent)
            });
        }

        // Set timestamps
        rpc.setStartTimestamp(Date.now());

        // Set large image
        if (config.rpc.largeImageURL) {
            try {
                const extURL = await RichPresence.getExternal(
                    client,
                    config.rpc.applicationId,
                    config.rpc.largeImageURL
                );
        
                if (extURL && extURL[0]?.external_asset_path) {
                    rpc.setAssetsLargeImage(extURL[0].external_asset_path);
                    if (config.rpc.largeImageText) {
                        rpc.setAssetsLargeText(config.rpc.largeImageText);
                    }
                } else {
                    Logger.warning('Failed to get external URL for large image');
                }
            } catch (error) {
                Logger.expection('Error setting large image:', error);
            }
        }

        // Set small image
        if (config.rpc.smallImageId) {
            rpc.setAssetsSmallImage(config.rpc.smallImageId);
            if (config.rpc.smallImageText) {
                rpc.setAssetsSmallText(config.rpc.smallImageText);
            }
        }

        if (config.rpc.buttonLabel && config.rpc.buttonURL) {
            rpc.addButton(config.rpc.buttonLabel, config.rpc.buttonURL);
        }

        rpc.setPlatform('desktop');

        // Update presence
        await client.user.setPresence({ activities: [rpc] });
        console.log('Rich Presence updated successfully');
    } catch (error) {
        console.error('Error updating Rich Presence:', error);
    }
}

function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Start Discord client
async function startBot() {
    if (client) {
        return;
    }

    try {
        client = new Client({
            checkUpdate: false,
            patchVoice: false,
            syncStatus: false
        });

        // Load all commands
        client.commands = new Map();
        const commandsPath = path.join(__dirname, '..', 'Commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const command = require(path.join(commandsPath, file));
                client.commands.set(command.name, command);
                Logger.load(`Loaded command: ${command.name}`);
            } catch (error) {
                Logger.expection(`Error loading command ${file}:`, error);
            }
        }

        client.on('ready', async () => {
            Logger.load(`Bot is online as ${client.user.tag}`);
            
            // Load and apply RPC settings when bot starts
            try {
                const configPath = path.join(__dirname, '..', 'Config', 'Client.json');
                const clientConfig = JSON.parse(fs.readFileSync(configPath));
                if (clientConfig.rpc?.enabled) {
                    await updateRichPresence(client, clientConfig);
                }
            } catch (error) {
                console.error('Error loading RPC settings:', error);
            }

            broadcastToClients({
                type: 'status',
                status: 'online',
                user: {
                    tag: client.user.tag,
                    id: client.user.id
                }
            });
        });

        client.on('messageCreate', async (message) => {
            if (message.channel.id === activeChannel) {
                broadcastToClients({
                    type: 'newMessage',
                    message: {
                        id: message.id,
                        content: message.content,
                        author: {
                            username: message.author.username,
                            avatar: message.author.displayAvatarURL(),
                        },
                        timestamp: message.createdTimestamp
                    }
                });
            }

            try {
                const settingsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'Config', 'Settings.json')));
                const prefix = settingsConfig.prefix || '.';
        
                if (!message.author.bot && message.content.startsWith(prefix)) {
                    const args = message.content.slice(prefix.length).trim().split(/ +/);
                    const commandName = args.shift().toLowerCase();
        
                    const commandPath = path.join(__dirname, '..', 'Commands', `${commandName}.js`);
                    
                    if (fs.existsSync(commandPath)) {
                        try {
                            const command = require(commandPath);
                            Logger.debug('Command module loaded:', command);
                            
                            if (command && typeof command.execute === 'function') {
                                await command.execute(message, args, client);
                            } else {
                                Logger.expection(`Invalid command module structure: ${commandName}`);
                            }
                        } catch (commandError) {
                            Logger.expection(`Error executing command ${commandName}:`, commandError);
                            Logger.expection('Command error full details:', commandError);
                            message.reply('Error using command.').catch(() => {});
                        }
                    }
                }
            } catch (error) {
                Logger.expection('Error in message handling:', error);
                Logger.expection('Full error:', error);
            }
        });

        await client.login(TOKEN);
    } catch (error) {
        Logger.expection('Failed to start bot:', error);
        broadcastToClients({
            type: 'error',
            message: error.message
        });
    }
}

// Stop Discord client
function stopBot() {
    if (client) {
        client.destroy();
        client = null;
        Logger.info('Bot stopped');
        broadcastToClients({
            type: 'status',
            status: 'offline'
        });
    }
}

function broadcastToClients(data) {
    const message = JSON.stringify(data);
    for (const client of connections) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

// Express routes
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
    if (client && client.user) {
        res.json({
            status: 'online',
            user: {
                tag: client.user.tag,
                id: client.user.id
            }
        });
    } else {
        res.json({ status: 'offline' });
    }
});

app.post('/api/start', async (req, res) => {
    await startBot();
    res.json({ status: 'success' });
});

app.post('/api/stop', (req, res) => {
    stopBot();
    res.json({ status: 'success' });
});

app.get('/api/servers', (req, res) => {
    if (!client) {
        return res.status(400).json({ error: 'Bot is not running' });
    }

    const servers = client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        channels: Array.from(guild.channels.cache
            .filter(channel => channel.type === 'GUILD_TEXT')
            .map(channel => ({
                id: channel.id,
                name: channel.name
            })))
    }));

    res.json(servers);
});

app.post('/api/send-message', async (req, res) => {
    const { channelId, message } = req.body;
    if (!client) {
        return res.status(400).json({ error: 'Bot is not running' });
    }
    
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        return res.status(400).json({ error: 'Channel not found' });
    }

    try {
        await channel.send(message);
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/messages/:channelId', async (req, res) => {
    if (!client) {
        return res.status(400).json({ error: 'Bot is not running' });
    }

    const channel = client.channels.cache.get(req.params.channelId);
    if (!channel) {
        return res.status(400).json({ error: 'Channel not found' });
    }

    try {
        const messages = await channel.messages.fetch({ limit: 50 }); 
        const formattedMessages = Array.from(messages.values()).map(msg => ({
            id: msg.id,
            content: msg.content,
            author: {
                username: msg.author.username,
                avatar: msg.author.displayAvatarURL(),
            },
            timestamp: msg.createdTimestamp,
            attachments: Array.from(msg.attachments.values()).map(att => ({
                url: att.url,
                name: att.name,
                contentType: att.contentType
            }))
        }));
        
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/config', (req, res) => {
    try {
        const defaultConfig = {
            settings: {
                notification: false,
                prefix: '.',
                webhook: ''
            },
            client: {
                afk: false,
                afkKeywords: [
                    "What's up? I'm afk, Will be back soon!",
                    "This is an auto message, I'm currently afk.",
                    "Wait a min, I'm afk",
                    "What, wait a sec",
                    "yo wait I'm afk dude",
                    "this is an auto msg, I'm afk",
                    "afk"
                ]
            },
            token: {
                token: ''
            }
        };

        const configPath = path.join(__dirname, '..', 'Config');
        let settings, client, token;

        try {
            settings = JSON.parse(fs.readFileSync(path.join(configPath, 'Settings.json')));
        } catch (err) {
            settings = defaultConfig.settings;
            fs.writeFileSync(path.join(configPath, 'Settings.json'), JSON.stringify(settings, null, 2));
        }

        try {
            client = JSON.parse(fs.readFileSync(path.join(configPath, 'Client.json')));
        } catch (err) {
            client = defaultConfig.client;
            fs.writeFileSync(path.join(configPath, 'Client.json'), JSON.stringify(client, null, 2));
        }

        try {
            token = JSON.parse(fs.readFileSync(path.join(configPath, 'Token.json')));
        } catch (err) {
            token = defaultConfig.token;
            fs.writeFileSync(path.join(configPath, 'Token.json'), JSON.stringify(token, null, 2));
        }

        res.json({
            settings,
            client,
            token
        });
    } catch (error) {
        console.error('Error loading config:', error);
        res.status(500).json({ 
            error: 'Failed to load settings',
            details: error.message
        });
    }
});

app.post('/api/config/save', async (req, res) => {
    const { settings, client: clientConfig, token } = req.body;
    
    try {
        if (settings) {
            fs.writeFileSync(path.join(__dirname, '..', 'Config', 'Settings.json'), 
                JSON.stringify(settings, null, 2));
        }
        if (clientConfig) {
            fs.writeFileSync(path.join(__dirname, '..', 'Config', 'Client.json'), 
                JSON.stringify(clientConfig, null, 2));
            
            if (client && client.user) {
                try {
                    await updateRichPresence(client, clientConfig);
                } catch (error) {
                    console.error('Error updating RPC:', error);
                }
            }
        }
        if (token) {
            fs.writeFileSync(path.join(__dirname, '..', 'Config', 'Token.json'), 
                JSON.stringify(token, null, 2));
        }
        
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/commands', (req, res) => {
    try {
        const commandsDir = path.join(__dirname, '..', 'Commands');
        const files = fs.readdirSync(commandsDir);
        
        const commands = files
            .filter(file => file.endsWith('.js'))
            .map(file => {
                try {
                    const command = require(path.join(commandsDir, file));
                    return {
                        name: command.name,
                        description: command.description
                    };
                } catch (err) {
                    console.error(`Error loading command from ${file}:`, err);
                    return null;
                }
            })
            .filter(cmd => cmd !== null);
        
        res.json(commands);
    } catch (error) {
        console.error('Error loading commands:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/command-categories', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync('../Config/CommandCategories.json'));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    if (!client) return res.status(400).json({ error: 'Bot is not running' });
    
    try {
        const users = Array.from(client.users.cache.values()).map(user => ({
            id: user.id,
            username: user.username,
            avatar: user.displayAvatarURL()
        }));
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/messages/dm/:userId', async (req, res) => {
    if (!client) return res.status(400).json({ error: 'Bot is not running' });
    
    try {
        const user = await client.users.fetch(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        console.log('Fetching DMs for user:', user.tag);
        
        const dmChannel = await user.createDM();
        console.log('DM Channel created:', dmChannel.id);
        
        const messages = await dmChannel.messages.fetch({ limit: 50 });
        console.log('Found messages:', messages.size);
        
        const formattedMessages = Array.from(messages.values()).map(msg => ({
            id: msg.id,
            content: msg.content,
            author: {
                username: msg.author.username,
                avatar: msg.author.displayAvatarURL()
            },
            timestamp: msg.createdTimestamp
        }));
        
        console.log('Formatted messages:', formattedMessages.length);
        
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching DMs:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.post('/api/messages/dm', async (req, res) => {
    if (!client) return res.status(400).json({ error: 'Bot is not running' });
    
    try {
        const { targetId, content } = req.body;
        const user = await client.users.fetch(targetId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const dmChannel = await user.createDM();
        await dmChannel.send(content);
        
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error sending DM:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.get('/api/me', (req, res) => {
    if (!client) return res.status(400).json({ error: 'Bot is not running' });
    res.json({ id: client.user.id });
});

app.get('/api/info', (req, res) => {
    if (!client || !client.user) {
        return res.status(400).json({ error: 'Bot is not running or not ready' });
    }
    
    try {
        const Path = path.join(__dirname, '..', 'Commands');
        
        const commandsCount = fs.readdirSync(Path).filter(file => file.endsWith('.js')).length;
    
        const info = {
            servers: client.guilds.cache.size,
            commands: commandsCount,
            channels: client.guilds.cache.reduce((acc, guild) => 
                acc + guild.channels.cache.size, 0),
            uptime: formatUptime(client.uptime)
        };
        
        res.json(info);
    } catch (error) {
        console.error('Error getting info:', error);
        res.status(500).json({ error: 'Failed to get info' });
    }
});

server.on('request', app);
server.listen(port, () => {
    Logger.load(`Kukuri Client is Loaded.`)
    Logger.info(`Server running at http://localhost:${port}`);
});