const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'webembed',
    description: 'Send a sample WebEmbed',
    execute(message, args, client) {
        const embed = new WebEmbed()
            .setAuthor({ name: 'Kukuri Client', url: 'https://github.com/Mikasuru/KukuriClient' })
            .setColor('RED')
            .setDescription('This is a sample WebEmbed created by Kukuri Client')
            .setProvider({ name: 'Sample Provider', url: 'https://example.com' })
            .setTitle('Sample WebEmbed')
            .setURL('https://github.com/Mikasuru/KukuriClient')
            .setImage('https://i.ytimg.com/vi/iBP8HambzpY/maxresdefault.jpg')
            .setRedirect('https://www.youtube.com/watch?v=iBP8HambzpY')
            .setVideo('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        message.channel.send({
            content: `Sample WebEmbed ${WebEmbed.hiddenEmbed}${embed}`,
        });
    },
};