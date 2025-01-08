const { MessageAttachment } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'voicemsg', // example: .voicemsg C:\Users\<user>\Downloads\<voice>.mp3
    description: 'Send a voice message using an audio file',
    category: 'Misc',
    execute: async (message, args, client) => {
        if (args.length < 1) {
            return message.channel.send('Please provide the path to the audio file. Usage: .voicemsg <filepath>');
        }

        const filePath = args[0];
        if (!fs.existsSync(filePath)) {
            return message.channel.send('The specified file does not exist.');
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        if (!['.mp3', '.ogg', '.wav'].includes(fileExtension)) {
            return message.channel.send('Unsupported file format. Please use .mp3, .ogg, or .wav files.');
        }

        try {
            const attachment = new MessageAttachment(
                filePath,
                'voice_message.ogg', // Discord requires .ogg for voice messages
                {
                    waveform: 'AAAAAAAAAAAA', // You can customize this
                    duration_secs: 10, // You can adjust this or calculate it from the file
                }
            );

            await message.channel.send({
                files: [attachment],
                flags: 'IS_VOICE_MESSAGE',
            });

            message.channel.send('Voice message sent successfully!');
        } catch (error) {
            Logger.expection('Error sending voice message:', error);
            message.channel.send('An error occurred while sending the voice message. Please try again.');
        }
    },
};