const { WebEmbed } = require('discord.js-selfbot-v13');
const { Solver } = require('2captcha');
const config = require('../../Config/Config.json');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'groupspam2',
    description: 'Send messages with captcha bypass',
    category: 'Raid',
    aliases: ['gspam2'],
    cooldown: 5,
    usage: '.groupspam2 [channel id] "Text" [interval] [count]',
    execute: async (message, args, client) => {
        if (!args[0] || args.length < 4) 
            return message.channel.send('Usage: .groupspam2 [channel id] "Text" [interval] [count]');

        let spamMessage = '', remainingArgs = [];
        if (!args[1].startsWith('"')) 
            return message.channel.send('Message must be in quotes.');

        let msgParts = [], foundEndQuote = false;
        for (let i = 1; i < args.length; i++) {
            msgParts.push(args[i]);
            if (args[i].endsWith('"')) {
                remainingArgs = args.slice(i + 1);
                foundEndQuote = true;
                break;
            }
        }
        
        if (!foundEndQuote) return message.channel.send('Message must end with quote.');
        spamMessage = msgParts.join(' ').slice(1, -1);
        if (remainingArgs.length !== 2) return message.channel.send('Specify interval and count.');

        const channelId = args[0];
        const interval = parseFloat(remainingArgs[0]);
        const count = parseInt(remainingArgs[1]);

        if (isNaN(interval) || interval < 0) return message.channel.send('Invalid interval.');
        if (isNaN(count) || count < 1 || count > 100) return message.channel.send('Count must be 1-100.');

        const targetChannel = client.channels.cache.get(channelId);
        if (!targetChannel) return message.channel.send('Invalid channel.');

        let sent = 0, failed = 0, shouldStop = false;
        const solver = new Solver(config.CaptchaSettings?.ApiKey);

        const statusMessage = await message.channel.send({ 
            content: `${WebEmbed.hiddenEmbed}${new WebEmbed()
                .setTitle('Group Spam Status')
                .setColor('#FF0000')
                .setDescription('Starting...')}`
        });

        const filter = m => m.content.toLowerCase() === 'stopspam' && 
            (m.author.id === message.author.id || config.BotSettings.BotAdmins.includes(m.author.id));
        const collector = message.channel.createMessageCollector({ filter });
        collector.on('collect', () => {
            shouldStop = true;
            collector.stop();
            message.channel.send('✅ Stopping...');
        });

        const updateStatus = async () => {
            const embed = new WebEmbed()
                .setTitle('Group Spam Status')
                .setColor(shouldStop ? '#FF0000' : '#00FF00')
                .setDescription([
                    `Progress: ${Math.round((sent + failed) / count * 100)}%`,
                    `Sent: ${sent}/${count}`,
                    `Failed: ${failed}`,
                    'Type "stopspam" to stop'
                ].join('\n'));
            
            await statusMessage.edit({ content: `${WebEmbed.hiddenEmbed}${embed}` });
        };

        try {
            for (let i = 0; i < count && !shouldStop; i++) {
                try {
                    await targetChannel.send(spamMessage);
                    sent++;
                } catch (error) {
                    if (error.message.includes('captcha')) {
                        try {
                            const solution = await solver.hcaptcha(
                                error.captcha?.siteKey || error.data?.sitekey,
                                'discord.com',
                                {
                                    invisible: 1,
                                    data: error.captcha?.rqdata || error.data?.rqdata,
                                    userAgent: error.captcha?.userAgent
                                }
                            );

                            await targetChannel.send(spamMessage, { captchaSolution: solution.data });
                            sent++;
                            continue;
                        } catch (captchaError) {
                            Logger.expection(`Captcha error: ${captchaError.message}`);
                            failed++;
                        }
                    } else {
                        Logger.expection(`Send error: ${error.message}`);
                        failed++;
                        
                        if (error.message.includes('Missing Access')) {
                            shouldStop = true;
                            await message.channel.send('❌ No channel access.');
                            break;
                        }
                    }
                }

                await updateStatus();
                if (interval > 0 && i < count - 1 && !shouldStop) {
                    await new Promise(resolve => setTimeout(resolve, interval * 1000));
                }
            }
        } finally {
            collector.stop();
            const finalEmbed = new WebEmbed()
                .setTitle('Group Spam Complete')
                .setColor('#00ff00')
                .setDescription([
                    `Total: ${count}`,
                    `Sent: ${sent}`,
                    `Failed: ${failed}`
                ].join('\n'));

            await statusMessage.edit({ content: `${WebEmbed.hiddenEmbed}${finalEmbed}` });
        }
    }
};