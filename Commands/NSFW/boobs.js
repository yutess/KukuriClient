const axios = require('axios');
const { MessageAttachment } = require('discord.js-selfbot-v13');
const Config = require('../../Config/Config.json');

module.exports = {
    name: 'boobs',
    description: 'Sends a boob NSFW image',
    category: 'NSFW',
    aliases: ['boobnsfw'],
    cooldown: 5,
    usage: '!boobs',
    permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
    nsfw: true,
    execute: async (message, args, client) => {
        try {
            // Check if the command is in a guild and whether NSFW is enabled
            if (message.guild) {
                if (!message.channel.nsfw && Config.GeneralSettings.EnableNSFW == false) {
                    return message.channel.send('This command can only be used in NSFW channels!');
                }
            } else {
                // If it's a DM, check NSFW settings
                if (Config.GeneralSettings.EnableNSFW == false) {
                    return message.channel.send('NSFW commands are disabled in DMs!');
                }
            }

            // Make API call
            const response = await axios.get('https://nekobot.xyz/api/image?type=boobs');
            console.log('API Response:', response.data); // Debug log

            if (!response.data || !response.data.message) {
                console.error('Invalid API response:', response.data);
                return message.channel.send('The API did not return a valid image. Please try again later.');
            }

            const imageUrl = response.data.message; // Use the "message" field for the image URL

            // Fetch image and send as attachment
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data);

            const attachment = new MessageAttachment(buffer, 'image.jpg');
            await message.channel.send({ files: [attachment] });

        } catch (error) {
            console.error('Error sending image:', error);
            await message.channel.send('Could not send image...');
        }
    },
};
