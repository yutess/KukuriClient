const process = require('process');
const { version } = require('../package.json');
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
    },
};