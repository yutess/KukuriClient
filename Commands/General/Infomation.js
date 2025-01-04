const process = require('process');
const { version } = require('../../package.json');
const si = require('systeminformation');
const Utils = require('../../Module/Utils')

// Cache system information
let systemInfoCache = null;
let lastCacheTime = 0;
const cacheDuration = 5000; // Cache for 5 seconds

module.exports = {
    name: 'info',
    description: 'Display system and bot information',
    category: 'General',
    async execute(message, args, client) {
        
        const currentTime = Date.now();
        
        if (systemInfoCache && currentTime - lastCacheTime < cacheDuration) {
            await message.channel.send(formatInfoText(systemInfoCache, client));
            return;
        }

        const [cpu, mem, graphics, cpuUsage] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.graphics(),
            si.currentLoad()
        ]);

        const gpuInfo = graphics.controllers.map(gpu => ({
            model: gpu.model || 'N/A',
            usage: gpu.memoryUsed ? Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100) : 'N/A'
        }));

        systemInfoCache = {
            systemInfo: {
                cpu: `${cpu.manufacturer} ${cpu.brand}`,
                ram: `${Math.round(mem.total / (1024 * 1024 * 1024))}GB`,
                gpus: gpuInfo,
                cpuUsage: `${Math.round(cpuUsage.currentLoad)}%`,
                ramUsage: `${Math.round((mem.used / mem.total) * 100)}%`,
            },
            nodeVersion: process.version,
            bunVersion: process.isBun ? Bun.version : 'Not using Bun',
            clientVersion: version
        };
        
        lastCacheTime = currentTime;
        await message.channel.send(formatInfoText(systemInfoCache, client));
    },
};

function formatInfoText(info, client) {
    const gpuText = info.systemInfo.gpus.map((gpu, index) => 
        `GPU ${index + 1}: ${gpu.model}\nGPU ${index + 1} Usage: ${gpu.usage}%`
    ).join('\n');

    return [
        '```ml',
        `Username: ${client.user.username}`,
        `CPU: ${info.systemInfo.cpu}`,
        `RAM: ${info.systemInfo.ram}`,
        `CPU Usage: ${info.systemInfo.cpuUsage}`,
        `RAM Usage: ${info.systemInfo.ramUsage}`,
        gpuText,
        `NodeJS Version: ${info.nodeVersion}`,
        `Bun Version: ${info.bunVersion}`,
        `Uptime: ${Utils.formatTime(client.uptime)}`,
        `Client Version: ${info.clientVersion}`,
        '```'
    ].join('\n');
}