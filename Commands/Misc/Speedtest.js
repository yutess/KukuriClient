const { UniversalSpeedTest } = require('universal-speedtest');

module.exports = {
    name: 'speedtest',
    description: 'Test network speed',
    category: 'Misc',
    aliases: ['speed', 'netspeed'],
    cooldown: 30,
    usage: '.speedtest',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        try {
            const statusMsg = await message.channel.send('Testing network speed...\n-# It might sending slowly, please wait...');
            const universalSpeedTest = new UniversalSpeedTest();
            const testResult = await universalSpeedTest.performOoklaTest();

            const textResult = `
            \`\`\`
🔍 Connection Details
• ISP: ${testResult.client?.isp || 'N/A'}
• Location: ${testResult.client?.country || 'N/A'}
• Server: ${testResult.bestServer?.sponsor || 'N/A'} (${testResult.bestServer?.name || 'N/A'})
📊 Speed Test Results
• Download: ${testResult.downloadResult?.speed || 'N/A'} Mbps
• Upload: ${testResult.uploadResult?.speed || 'N/A'} Mbps
• Ping: ${testResult.pingResult?.latency || 'N/A'} ms
• Jitter: ${testResult.pingResult?.jitter || 'N/A'} ms
            \`\`\`
                `;
            await statusMsg.edit(textResult);
        } catch (error) {
            console.error('Error:', error);
            await message.channel.send('An error occurred during speed test. Please try again later.');
        }
    }
};