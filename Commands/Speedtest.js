const { UniversalSpeedTest } = require('universal-speedtest');

module.exports = {
    name: 'speedtest',
    description: 'Test network speed',
    async execute(message, args, client) {
        try {
            const statusMsg = await message.reply('Testing network speed...');
            const universalSpeedTest = new UniversalSpeedTest();
            const testResult = await universalSpeedTest.performOoklaTest();

            const textResult = `🌐 Network Speed Test Results
                🔍 Connection Details
                • ISP: ${testResult.client?.isp || 'N/A'}
                • Location: ${testResult.client?.country || 'N/A'}
                • Server: ${testResult.bestServer?.sponsor || 'N/A'} (${testResult.bestServer?.name || 'N/A'})

                📊 Speed Test Results
                • Download: ${testResult.downloadResult?.speed || 'N/A'} Mbps
                • Upload: ${testResult.uploadResult?.speed || 'N/A'} Mbps
                • Ping: ${testResult.pingResult?.latency || 'N/A'} ms
                • Jitter: ${testResult.pingResult?.jitter || 'N/A'} ms`;
            await statusMsg.edit(textResult);
        } catch (error) {
            console.error('Error:', error);
            await message.reply('An error occurred during speed test. Please try again later.');
        }
    }
};