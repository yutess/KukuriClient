const { Client, RichPresence, CustomStatus, SpotifyRPC } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'rpc',
    description: 'Set up Rich Presence',
    category: 'Misc',
    aliases: ['richpresence', 'activity'],
    cooldown: 10,
    usage: '.rpc [type] [details...]',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        const filter = m => m.author.id === message.author.id;
        const collect = async (prompt) => {
            await message.channel.send(prompt);
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            const content = collected.first()?.content;
            return content === 'None' || content === '-' ? null : content;
        };

        const rpcType = await collect('Choose RPC Type:\n1️⃣: Rich Presence\n2️⃣: Custom Status\n3️⃣: Spotify RPC\n(If you want to skip, type "None" or "-")');

        switch (rpcType) {
            case '1':
            case '1️⃣':
                await setRichPresence(message, collect, client);
                break;
            case '2':
            case '2️⃣':
                await setCustomStatus(message, collect, client);
                break;
            case '3':
            case '3️⃣':
                await setSpotifyRPC(message, collect, client);
                break;
            default:
                message.channel.send('❌ Incorrect RPC type selected.');
        }
    },
};

async function setRichPresence(message, collect, client) {
    try {
        const applicationId = await collect('📝 Application ID:');
        if (!applicationId) {
            return message.channel.send('❌ Please provide Application ID');
        }

        const name = await collect('📝 RPC Title:') || 'Kukuri Client';
        const details = await collect('📝 Infomation:');
        const state = await collect('📝 State:');
        const largeImageUrl = await collect('📝 Large image URL:');
        const smallImageId = await collect('📝 Small image ID:');

        const rpc = new RichPresence(client)
            .setApplicationId(applicationId)
            .setName(name);

        if (details) rpc.setDetails(details);
        if (state) rpc.setState(state);

        if (largeImageUrl) {
            try {
                const getExtendURL = await RichPresence.getExternal(client, applicationId, largeImageUrl);
                rpc.setAssetsLargeImage(getExtendURL[0].external_asset_path);
            } catch (error) {
                message.channel.send('⚠️ Cannot get external URL for large image.');
            }
        }

        if (smallImageId) rpc.setAssetsSmallImage(smallImageId);

        client.user.setPresence({ activities: [rpc] });
        message.channel.send('✅ Set Rich Presence Successfully!');
    } catch (error) {
        message.channel.send(`❌ Error: ${error.message}`);
    }
}

async function setCustomStatus(message, collect, client) {
    try {
        const emoji = await collect('📝 Emoji:');
        const state = await collect('📝 State:');

        if (!state && !emoji) {
            return message.channel.send('❌ Provide at least one of the following: emoji, state');
        }

        const custom = new CustomStatus(client);
        if (emoji) custom.setEmoji(emoji);
        if (state) custom.setState(state);

        client.user.setPresence({ activities: [custom] });
        message.channel.send('✅ Set Custom Status Successfully!');
    } catch (error) {
        message.channel.send(`❌ Error: ${error.message}`);
    }
}

async function setSpotifyRPC(message, collect, client) {
    try {
        const songName = await collect('📝 Song name:');
        if (!songName) {
            return message.channel.send('❌ Required song name');
        }

        const artists = await collect('📝 Artist name:') || 'Kukuri and the Harmonic Odyssey';
        const albumName = await collect('📝 Album name:') || songName;
        const duration = parseInt(await collect('📝 Song duration (in second):') || '240');

        const spotify = new SpotifyRPC(client)
            .setAssetsLargeImage('spotify:ab67616d00001e02768629f8bc5b39b68797d1bb')
            .setState(artists)
            .setDetails(songName)
            .setAssetsLargeText(albumName)
            .setStartTimestamp(Date.now())
            .setEndTimestamp(Date.now() + duration * 1000);

        client.user.setPresence({ activities: [spotify] });
        message.channel.send('✅ Set Spotify RPC Successfully!');
    } catch (error) {
        message.channel.send(`❌ Error: ${error.message}`);
    }
}