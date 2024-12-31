const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js-selfbot-v13');
const process = require('process');
const { version } = require('../package.json');
const os = require('os');
const si = require('systeminformation');
const Utils = require('../Module/Utils')

module.exports = {
    name: 'info',
    description: 'Display system and bot information',
    async execute(message, args, client) {
        message.delete()
        
        // Get system specs and usage
        const [cpu, mem, graphics] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.graphics()
        ]);
        
        const cpuUsage = await si.currentLoad();

        // Format GPU information to include all GPUs
        const gpuInfo = graphics.controllers.map(gpu => ({
            model: gpu.model || 'N/A',
            usage: gpu.memoryUsed ? Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100) : 'N/A'
        }));

        const info = {
            username: client.user.username,
            systemInfo: {
                cpu: `${cpu.manufacturer} ${cpu.brand}`,
                ram: `${Math.round(mem.total / (1024 * 1024 * 1024))}GB`,
                gpus: gpuInfo,
                cpuUsage: `${Math.round(cpuUsage.currentLoad)}%`,
                ramUsage: `${Math.round((mem.used / mem.total) * 100)}%`,
            },
            nodeVersion: process.version,
            bunVersion: process.isBun ? Bun.version : 'Not using Bun',
            uptime: Utils.formatTime(client.uptime),
            clientVersion: version
        };

        const permissions = message.channel.permissionsFor(client.user);

        if (permissions && permissions.has('ATTACH_FILES')) {
            const extraGpuHeight = (gpuInfo.length - 1) * 65; // 65px for each additional GPU
            const canvas = createCanvas(900, 900 + extraGpuHeight);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#1e1e2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const headerHeight = 80;
            ctx.fillStyle = '#7289DA';
            ctx.fillRect(0, 0, canvas.width, headerHeight);

            ctx.font = 'bold 40px "Arial"';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText('System Information', canvas.width / 2, 52);

            const startY = headerHeight + 40;
            const boxHeight = 50;
            const boxSpacing = 15;
            const boxRadius = 12;

            let sections = [
                { label: 'Username', value: info.username },
                { label: 'CPU', value: info.systemInfo.cpu },
                { label: 'RAM', value: info.systemInfo.ram },
                { label: 'CPU Usage', value: info.systemInfo.cpuUsage },
                { label: 'RAM Usage', value: info.systemInfo.ramUsage },
            ];

            gpuInfo.forEach((gpu, index) => {
                sections.push(
                    { label: `GPU ${index + 1}`, value: gpu.model },
                    { label: `GPU ${index + 1} Usage`, value: `${gpu.usage}%` }
                );
            });

            sections = sections.concat([
                { label: 'NodeJS Version', value: info.nodeVersion },
                { label: 'Bun Version', value: info.bunVersion },
                { label: 'Uptime', value: info.uptime },
                { label: 'Client Version', value: info.clientVersion }
            ]);

            sections.forEach((section, index) => {
                const y = startY + (boxHeight + boxSpacing) * index;

                ctx.fillStyle = '#2c2f3a';
                roundRect(ctx, 30, y, canvas.width - 60, boxHeight, boxRadius);
                ctx.fill();

                ctx.font = 'bold 22px "Arial"';
                ctx.fillStyle = '#7289DA';
                ctx.textAlign = 'left';
                ctx.fillText(section.label + ':', 50, y + 32);

                ctx.font = '22px "Arial"';
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.fillText(section.value, 250, y + 32);
            });

            ctx.font = '16px Arial';
            ctx.fillStyle = '#7289DA';
            ctx.textAlign = 'right';
            ctx.fillText(`Generated at ${new Date().toLocaleString()}`, canvas.width - 40, canvas.height - 20);

            const buffer = canvas.toBuffer();
            const attachment = new MessageAttachment(buffer, 'kukuri-info.png');
            message.channel.send({
                content: `Kukuri Client v${version}`,
                files: [attachment],
            });
        } else {
            // Create text version with all GPUs
            const gpuText = gpuInfo.map((gpu, index) => 
                `GPU ${index + 1}: ${gpu.model}\nGPU ${index + 1} Usage: ${gpu.usage}%`
            ).join('\n');

            const infoText = [
                '```ml',
                `Username: ${info.username}`,
                `CPU: ${info.systemInfo.cpu}`,
                `RAM: ${info.systemInfo.ram}`,
                `CPU Usage: ${info.systemInfo.cpuUsage}`,
                `RAM Usage: ${info.systemInfo.ramUsage}`,
                gpuText,
                `NodeJS Version: ${info.nodeVersion}`,
                `Bun Version: ${info.bunVersion}`,
                `Uptime: ${info.uptime}`,
                `Client Version: ${info.clientVersion}`,
                '```'
            ].join('\n');

            await message.reply(infoText);
        }
    },
};

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}