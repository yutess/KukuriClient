const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'fakeyt',
    description: 'Faking the video',
    execute(message, args, client) {
        message.delete();
        const embed = new WebEmbed()
            .setAuthor({ name: 'simpleduldde1723', url: 'https://github.com/Mikasuru/KukuriClient' })
            .setColor('ea3323')
            .setProvider({ name: 'YouTube', url: 'https://github.com/Mikasuru/KukuriClient' })
            .setTitle('WATCH BEFORE DELETE')
            .setURL('https://github.com/Mikasuru/KukuriClient')
            .setImage('https://files.yande.re/sample/47deaeeac0800ee808b2b760aba30973/yande.re%201200651%20sample%20cameltoe%20detexted%20dress_shirt%20leone_%28kamina0205%29%20no_bra%20open_shirt%20pantsu%20thong.jpg')
            .setRedirect('https://www.youtube.com/watch?v=iBP8HambzpY')
            .setVideo('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        message.channel.send({
            content: `AYO WATCH THIS LOL <https://www.youtube.com/watch?v=iBP8HambzpY> ${WebEmbed.hiddenEmbed}${embed}`,
        });
    },
};