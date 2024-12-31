const { UniversalSpeedTest } = require('universal-speedtest');
const { createCanvas } = require('canvas');
const { MessageAttachment } = require('discord.js-selfbot-v13');

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

            try {
                const canvas = createCanvas(800, 400);
                const ctx = canvas.getContext('2d');

                // Background
                ctx.fillStyle = '#2f3136';
                ctx.fillRect(0, 0, 800, 400);

                // Title
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 28px Arial';
                ctx.fillText('Network Speed Test Results', 30, 50);

                // Connection Details
                ctx.font = 'bold 20px Arial';
                ctx.fillText('📡 Connection Details', 30, 100);
                ctx.font = '18px Arial';
                ctx.fillText(`ISP: ${testResult.client?.isp || 'N/A'}`, 50, 130);
                ctx.fillText(`Location: ${testResult.client?.country || 'N/A'}`, 50, 160);

                // Speed Results
                ctx.font = 'bold 24px Arial';
                
                // Download
                ctx.fillStyle = '#43b581';
                ctx.fillText('Download', 50, 220);
                ctx.font = '32px Arial';
                ctx.fillText(`${testResult.downloadResult?.speed || 'N/A'} Mbps`, 50, 260);

                // Upload
                ctx.fillStyle = '#4f545c';
                ctx.fillText('Upload', 300, 220);
                ctx.font = '32px Arial';
                ctx.fillText(`${testResult.uploadResult?.speed || 'N/A'} Mbps`, 300, 260);

                // Ping
                ctx.fillStyle = '#faa61a';
                ctx.fillText('Ping', 550, 220);
                ctx.font = '32px Arial';
                ctx.fillText(`${testResult.pingResult?.latency || 'N/A'} ms`, 550, 260);

                // Server info
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.fillText(`Server: ${testResult.bestServer?.sponsor || 'N/A'} (${testResult.bestServer?.name || 'N/A'})`, 30, 350);
                ctx.fillText(`Test Duration: ${testResult.totalTime || 'N/A'} seconds`, 30, 380);


                const buffer = canvas.toBuffer();
                const attachment = new MessageAttachment(buffer, 'kukuri-commands.png');
                message.channel.send({
                    content: 'Network Speed Test Results\n-# *(Kukuri Client | Speedtest)*',
                    files: [attachment],
                });
            } catch (canvasError) {
                console.error('Canvas Error:', canvasError);
                await statusMsg.edit(textResult);
            }
        } catch (error) {
            console.error('Error:', error);
            await message.reply('An error occurred during speed test. Please try again later.');
        }
    }
};