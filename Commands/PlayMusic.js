const ytdl = require('@distube/ytdl-core');

module.exports = {
    name: 'play',
    description: 'Play music in a voice channel',
    async execute(message, args, client) {
        // Check for url
        const url = args[0];
        if (!url || !ytdl.validateURL(url)) {
            return message.reply('Please provide a valid YouTube URL.');
        }

        const vcID = args[1];
        if (!vcID) {
            return message.reply('Please provide a valid voice channel ID.');
        }

        try {

            const channel = client.channels.cache.get(vcID);
            const connection = await client.voice.joinChannel(channel, {
                selfMute: true,
                selfDeaf: false,
                selfVideo: false,
            });

            const dispatcher = connection.playAudio(
                ytdl(args[0], {
                  quality: 'highestaudio',
                }),
            );
            dispatcher.on('start', () => {
                message.reply(`Now playing: ${url}`);
                // pause
                /*console.log('paused');
                dispatcher.pause();
                // resume
                setTimeout(() => {
                  console.log('resumed');
                  dispatcher.resume();
                }, 5_000);*/
            
                // Set volume
                dispatcher.setVolume(1.0);
                message.reply('Volume set to 100%');
            });
            
            dispatcher.on('finish', () => {
                message.reply('Playback finished.');
            });
              dispatcher.on('error', console.error);
              // Leave voice
              setTimeout(() => {
                message.reply('Leaving the voice channel.');
                connection.disconnect();
            }, 30_000);
        } catch (error) {
            console.error('Error joining voice channel or playing audio:', error);
            message.reply('An error occurred while trying to play the audio.');
        }
    },
};
