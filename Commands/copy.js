const Logger = require('./Module/Logger');

module.exports = {
    name: 'copy',
    description: 'Copy the profile picture of a specified user and send it to a server channel',
    async execute(message, args, client) {
        // Victim ID
        const userId = '5074xxxxxxxxx89610';
        // Server and Channel ID to send the picture
        const guildId = '12xxxxxxxxxx1476147';
        const channelId = '12968xxxxxxxxxx476150';

        try {
            const user = await client.users.fetch(userId);

            const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.resolve(channelId);

            channel.send({ content: `Profile of <@${userId}>:`, files: [avatarUrl] })
                .then(() => Logger.info(`Done`))
                .catch(error => Logger.expection(`Error:`, error));

            message.reply('AA!');
        } catch (error) {
            Logger.expection('Error:', error);
            message.reply('AA');
        }
    },
};
