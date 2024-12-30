const { WebEmbed } = require('discord.js-selfbot-v13');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
    name: 'userinfo',
    description: 'Get information about a user',
    async execute(message, args, client) {
        try {
            const mentionedUser = message.mentions.users.first() || message.author;
            const member = message.guild ? message.guild.members.cache.get(mentionedUser.id) : null;
            
            try {
                // Create canvas
                const canvas = Canvas.createCanvas(1000, 500);
                const ctx = canvas.getContext('2d');

                // Background with gradient
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, '#1a1c1f');
                gradient.addColorStop(1, '#2C2F33');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add subtle pattern
                ctx.globalAlpha = 0.1;
                for (let i = 0; i < canvas.width; i += 20) {
                    for (let j = 0; j < canvas.height; j += 20) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(i, j, 1, 1);
                    }
                }
                ctx.globalAlpha = 1;

                // Draw user avatar with fancy border
                try {
                    const avatar = await Canvas.loadImage(mentionedUser.displayAvatarURL({ format: 'png', size: 512 }));
                    const avatarSize = 180;
                    const avatarX = 50;
                    const avatarY = 50;

                    // Glowing effect
                    ctx.shadowColor = '#5865F2';
                    ctx.shadowBlur = 15;
                    
                    // White border
                    ctx.beginPath();
                    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                    // Reset shadow
                    ctx.shadowBlur = 0;
                    
                    // Clip for avatar
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
                    ctx.restore();
                } catch (err) {
                    console.error('Failed to load avatar:', err);
                }

                // User tag with shadow
                ctx.shadowColor = '#5865F2';
                ctx.shadowBlur = 10;
                ctx.font = '40px "Roboto Bold", Arial';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(mentionedUser.tag, 280, 100);
                ctx.shadowBlur = 0;

                // Decorative line
                const lineGradient = ctx.createLinearGradient(280, 0, 900, 0);
                lineGradient.addColorStop(0, '#5865F2');
                lineGradient.addColorStop(1, '#5865F2');
                ctx.strokeStyle = lineGradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(280, 120);
                ctx.lineTo(900, 120);
                ctx.stroke();

                // Information box
                const startX = 280;
                let startY = 170;
                const lineHeight = 40;

                // User information
                const info = [
                    ['User ID', mentionedUser.id],
                    ['Created', new Date(mentionedUser.createdTimestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })],
                ];

                if (member) {
                    info.push(
                        ['Joined', new Date(member.joinedTimestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })],
                        ['Highest Role', member.roles.highest.name],
                        ['Roles', `${member.roles.cache.size} roles`]
                    );
                }

                // Status indicators
                const statusColors = {
                    online: '#43b581',
                    idle: '#faa61a',
                    dnd: '#f04747',
                    offline: '#747f8d'
                };

                // Draw status circle
                const status = member?.presence?.status || 'offline';
                ctx.beginPath();
                ctx.arc(240, 210, 8, 0, Math.PI * 2);
                ctx.fillStyle = statusColors[status];
                ctx.fill();

                // Draw information
                const emojis = ['🆔', '📅', '📥', '👑', '🎭'];
                info.forEach((item, index) => {
                    // Draw label
                    ctx.font = '26px "Roboto Bold", Arial';
                    ctx.fillStyle = '#5865F2';
                    const label = `${emojis[index]} ${item[0]}`;
                    ctx.fillText(label, startX, startY);

                    // Draw value
                    ctx.font = '26px "Roboto", Arial';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(`: ${item[1]}`, startX + 200, startY);
                    startY += lineHeight;
                });

                // If member has roles, display them in a grid
                if (member && member.roles.cache.size > 1) {
                    startY += 20;
                    ctx.font = '26px "Roboto Bold", Arial';
                    ctx.fillStyle = '#5865F2';
                    ctx.fillText('🏷️ Role List:', startX, startY);
                    
                    const roles = member.roles.cache
                        .filter(role => role.name !== '@everyone')
                        .sort((a, b) => b.position - a.position)
                        .first(6);  // Limit to first 6 roles

                    startY += 40;
                    const roleStartX = startX;
                    let currentX = roleStartX;
                    
                    roles.forEach(role => {
                        // Role pill background
                        const roleName = role.name;
                        const roleWidth = ctx.measureText(roleName).width + 20;
                        const roleHeight = 30;
                        
                        ctx.fillStyle = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99AAB5';
                        ctx.globalAlpha = 0.2;
                        ctx.beginPath();
                        ctx.roundRect(currentX, startY - 20, roleWidth, roleHeight, 15);
                        ctx.fill();
                        ctx.globalAlpha = 1;

                        // Role name
                        ctx.font = '20px "Roboto", Arial';
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillText(roleName, currentX + 10, startY);
                        
                        currentX += roleWidth + 10;
                    });
                }

                // Send the image
                const attachment = canvas.toBuffer();
                const userEmbed = new WebEmbed()
                    .setColor('#5865F2')
                    .setImage('attachment://userinfo.png');

                await message.channel.send({
                    content: `${WebEmbed.hiddenEmbed}${userEmbed}`,
                    files: [{
                        attachment: attachment,
                        name: 'userinfo.png'
                    }]
                });

            } catch (canvasError) {
                console.error('Canvas failed, falling back to text embed:', canvasError);
                
                // Fallback to text embed
                let userInfo = [
                    `🆔 **User ID:** ${mentionedUser.id}`,
                    `📅 **Created:** ${new Date(mentionedUser.createdTimestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`
                ];

                if (member) {
                    userInfo.push(
                        `📥 **Joined Server:** ${new Date(member.joinedTimestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}`,
                        `👑 **Highest Role:** ${member.roles.highest.name}`,
                        `🎭 **Roles [${member.roles.cache.size}]:** ${member.roles.cache
                            .filter(role => role.name !== '@everyone')
                            .sort((a, b) => b.position - a.position)
                            .map(role => role.name)
                            .slice(0, 10)
                            .join(', ')}${member.roles.cache.size > 10 ? '...' : ''}`
                    );
                }

                const userEmbed = new WebEmbed()
                    .setColor('#5865F2')
                    .setTitle(`User Information - ${mentionedUser.tag}`)
                    .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }))
                    .setDescription(userInfo.join('\n'));

                await message.channel.send({
                    content: `${WebEmbed.hiddenEmbed}${userEmbed}`
                });
            }
        } catch (error) {
            console.error('UserInfo command error:', error);
            message.reply('❌ An error occurred while fetching user information.');
        }
    },
};