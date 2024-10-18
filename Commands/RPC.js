const { Client, RichPresence, CustomStatus, SpotifyRPC } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'rpc', // I DID NOT TEST THIS COMMAND, DONT BLAME ME IF IT BUG
    description: 'Set up Rich Presence interactively',
    async execute(message, args, client) {
        const filter = m => m.author.id === message.author.id;
        const collect = async (prompt) => {
            await message.channel.send(prompt);
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            return collected.first()?.content;
        };

        const rpcType = await collect('# Choose RPC type:\n1. Rich Presence,\n2. Custom Status,\n3. Spotify');

        switch (rpcType) {
            case '1':
                await setRichPresence(message, collect, client);
                break;
            case '2':
                await setCustomStatus(message, collect, client);
                break;
            case '3':
                await setSpotifyRPC(message, collect, client);
                break;
            default:
                message.reply('Invalid choice. Please try again.');
        }
    },
};

async function setRichPresence(message, collect, client) {
    const applicationId = await collect('# Enter application ID:');
    const name = await collect('# Enter name:');
    const details = await collect('# Enter details:');
    const state = await collect('# Enter state:');
    const largeImageUrl = await collect('# Enter large image URL:');
    const smallImageId = await collect('# Enter small image ID:');

    const getExtendURL = await RichPresence.getExternal(client, applicationId, largeImageUrl);

    const rpc = new RichPresence(client)
        .setApplicationId(applicationId)
        .setName(name)
        .setDetails(details)
        .setState(state)
        .setAssetsLargeImage(getExtendURL[0].external_asset_path)
        .setAssetsSmallImage(smallImageId);

    client.user.setPresence({ activities: [rpc] });
    message.reply('Rich Presence set successfully!');
}

async function setCustomStatus(message, collect, client) {
    const emoji = await collect('# Enter emoji:');
    const state = await collect('# Enter state:');

    const custom = new CustomStatus(client).setEmoji(emoji).setState(state);

    client.user.setPresence({ activities: [custom] });
    message.reply('Custom Status set successfully!');
}

async function setSpotifyRPC(message, collect, client) {
    const songName = await collect('# Enter song name:');
    const artists = await collect('# Enter artists (comma-separated):');
    const albumName = await collect('# Enter album name:');
    const duration = await collect('# Enter song duration in seconds:');

    const spotify = new SpotifyRPC(client)
        .setAssetsLargeImage('spotify:ab67616d00001e02768629f8bc5b39b68797d1bb')
        .setState(artists)
        .setDetails(songName)
        .setAssetsLargeText(albumName)
        .setStartTimestamp(Date.now())
        .setEndTimestamp(Date.now() + duration * 1000);

    client.user.setPresence({ activities: [spotify] });
    message.reply('Spotify RPC set successfully!');
}