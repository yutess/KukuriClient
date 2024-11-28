module.exports = {
    name: 'copy',
    description: 'Copy the profile picture of a specified user and send it to a server channel',
    async execute(message, args, client) {
        // Victim ID
        const userId = '507479359150489610';
        // Server and Channel ID to send picture
        const guildId = '1296895620841476147';
        const channelId = '1296895620841476150';

        try {
            const user = await client.users.fetch(userId);
            const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.resolve(channelId);

            channel.send({ content: `นี่คือรูปโปรไฟล์ของ <@${userId}>:`, files: [avatarUrl] })
                .then(() => console.log(`ส่งรูปโปรไฟล์ไปยังแชนแนลในเซิร์ฟเวอร์สำเร็จ`))
                .catch(error => console.error(`ไม่สามารถส่งรูปโปรไฟล์ไปยังแชนแนล:`, error));

            message.reply('Done!');
        } catch (error) {
            console.error('Error:', error);
            message.reply('done');
        }
    },
};
