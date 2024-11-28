module.exports = {
    name: 'copy',
    description: 'Copy the profile picture of a specified user and send it to a server channel',
    async execute(message, args, client) {
        // ID ของผู้ใช้ที่ต้องการก๊อปรูปโปรไฟล์
        const userId = '507479359150489610';
        // ID ของเซิร์ฟเวอร์และแชนแนลที่ต้องการส่งรูป
        const guildId = '1296895620841476147';
        const channelId = '1296895620841476150'; // ใส่ Channel ID ที่ต้องการส่งข้อความ

        try {
            // ดึงข้อมูลผู้ใช้จากไอดี
            const user = await client.users.fetch(userId);

            // ดึง URL ของรูปโปรไฟล์ในขนาดที่ใหญ่ที่สุด
            const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

            // เข้าถึงเซิร์ฟเวอร์และแชนแนลที่ต้องการส่งข้อความ
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.resolve(channelId);

            // ส่งรูปโปรไฟล์ไปที่แชนแนลในเซิร์ฟเวอร์
            channel.send({ content: `นี่คือรูปโปรไฟล์ของ <@${userId}>:`, files: [avatarUrl] })
                .then(() => console.log(`ส่งรูปโปรไฟล์ไปยังแชนแนลในเซิร์ฟเวอร์สำเร็จ`))
                .catch(error => console.error(`ไม่สามารถส่งรูปโปรไฟล์ไปยังแชนแนล:`, error));

            // แจ้งผู้ใช้ที่ใช้คำสั่งว่าทำงานสำเร็จ
            message.reply('asd!');
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            message.reply('asd');
        }
    },
};
