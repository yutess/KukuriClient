const { WebEmbed } = require('discord.js-selfbot-v13');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
    name: 'serverinfo',
    description: 'Get information about the current server',
    async execute(message, args, client) {
        if (!message.guild) return message.reply('❌ This command can only be used in a server.');
        try {
            // Collect server information
            const guild = message.guild;
            const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
            const channels = guild.channels.cache;
            const roles = guild.roles.cache;
            const emojis = guild.emojis.cache;
            const boosts = guild.premiumSubscriptionCount;
            const verificationLevel = {
                0: "None",
                1: "Low",
                2: "Medium",
                3: "High",
                4: "Very High"
            }[guild.verificationLevel];

            try {
                // Try to create and send canvas version
                const canvas = Canvas.createCanvas(800, 400);
                const ctx = canvas.getContext('2d');

                // Background gradient
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#1a1c1f');
                gradient.addColorStop(1, '#2C2F33');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Server icon
                try {
                    const icon = await Canvas.loadImage(guild.iconURL({ format: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png');
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(120, 120, 80, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(icon, 40, 40, 160, 160);
                    ctx.restore();
                } catch (err) {
                    console.error('Failed to load server icon:', err);
                }

                // Text settings
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 32px Arial';
                ctx.fillText(guild.name, 240, 80);

                // Server information
                ctx.font = '20px Arial';
                const info = [
                    `🆔 Server ID: ${guild.id}`,
                    `👑 Owner: ${owner ? owner.user.tag : 'Not found'}`,
                    `👥 Members: ${guild.memberCount}`,
                    `📅 Created: ${guild.createdAt.toLocaleDateString('en-US')}`,
                    `💬 Channels: ${channels.size}`,
                    `👔 Roles: ${roles.size}`,
                    `😀 Emojis: ${emojis.size}`,
                    `🚀 Boosts: ${boosts || 0}`,
                    `🛡️ Verification: ${verificationLevel}`
                ];

                let y = 140;
                info.forEach(line => {
                    ctx.fillText(line, 240, y);
                    y += 30;
                });

                // Convert canvas to buffer
                const attachment = canvas.toBuffer();

                // Send as WebEmbed with canvas image
                const serverEmbed = new WebEmbed()
                    .setColor('#5865F2')
                    .setImage('attachment://serverinfo.png');

                await message.channel.send({
                    content: `${WebEmbed.hiddenEmbed}${serverEmbed}`,
                    files: [{
                        attachment: attachment,
                        name: 'serverinfo.png'
                    }]
                });

            } catch (canvasError) {
                // Fallback to text embed if canvas fails
                console.error('Canvas failed, falling back to text embed:', canvasError);
                
                const serverEmbed = new WebEmbed()
                    .setColor('#5865F2')
                    .setTitle(`📊 Server Information for ${guild.name}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setDescription([
                        `Server ID: ${guild.id}`,
                        `Owner: ${owner ? `${owner.user.tag} (<@${owner.id}>)` : 'Not found'}`,
                        `Members: ${guild.memberCount}`,
                        `Created: ${guild.createdAt.toLocaleDateString('en-US')}`,
                        `Channels: ${channels.size}`,
                        `Roles: ${roles.size}`,
                        `Emojis: ${emojis.size}`,
                        `Boosts: ${boosts || 0}`,
                        `Verification Level: ${verificationLevel}`,
                    ].join('\n'));

                await message.channel.send({
                    content: `${WebEmbed.hiddenEmbed}${serverEmbed}`
                });
            }
        } catch (error) {
            console.error('ServerInfo command error:', error);
            message.reply('❌ An error occurred while fetching server information.');
        }
    },
};