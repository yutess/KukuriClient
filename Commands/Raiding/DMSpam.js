const { WebEmbed } = require('discord.js-selfbot-v13');
const { Solver } = require('2captcha');
const config = require('../../Config/Config.json');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'dmspam',
    description: 'Send messages to a specific user',
    category: 'Raid',
    aliases: ['massdm', 'spamuser'],
    cooldown: 5,
    usage: '.dmspam <userid/@user> "message" [interval] [count]',
    execute: async (message, args, client) => {
        if (args.length < 4) {
            return message.channel.send('Example: dmspam <userid / @user> "message" [interval] [count]');
        }

        // Get target user
        let targetUser;
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        } else {
            try {
                targetUser = await client.users.fetch(args[0]);
            } catch (error) {
                return message.channel.send('Invalid user ID or mention.');
            }
        }

        // Check if target is self
        if (targetUser.id === client.user.id) {
            return message.channel.send('Cannot spam yourself.');
        }

        let spamMessage = '';
        let remainingArgs = [];
        
        if (!args[1].startsWith('"')) {
            return message.channel.send('Please enclose the message in quotes (").');
        }
            
        let msgParts = [];
        let foundEndQuote = false;
        
        for (let i = 1; i < args.length; i++) {
            msgParts.push(args[i]);
            if (args[i].endsWith('"')) {
                remainingArgs = args.slice(i + 1);
                foundEndQuote = true;
                break;
            }
        }
        
        if (!foundEndQuote) {
            return message.channel.send('Please ensure the message is properly enclosed in quotes (").');
        }

        spamMessage = msgParts.join(' ').slice(1, -1);
        
        if (remainingArgs.length !== 2) {
            return message.channel.send('Please specify the interval and count.');
        }

        const interval = parseFloat(remainingArgs[0]);
        const count = parseInt(remainingArgs[1]);

        if (isNaN(interval) || interval < 0) {
            return message.channel.send('Invalid interval.');
        }

        if (isNaN(count) || count < 1 || count > 100) {
            return message.channel.send('Count must be between 1 and 100.');
        }

        let sent = 0;
        let failed = 0;
        let shouldStop = false;

        const statusEmbed = new WebEmbed()
            .setTitle('DM Spam Status')
            .setColor('#FF0000')
            .setDescription('Starting DM spam...');
        
        const statusMessage = await message.channel.send({ 
            content: `${WebEmbed.hiddenEmbed}${statusEmbed}` 
        });

        // Setup stop collector
        const filter = m => m.content.toLowerCase() === 'stopdm' && 
            (m.author.id === message.author.id || config.BotSettings.BotAdmins.includes(m.author.id));
        const collector = message.channel.createMessageCollector({ filter });
        
        collector.on('collect', () => {
            shouldStop = true;
            collector.stop();
            message.channel.send('✅ Stopping DM spam...');
        });

        // Update status function
        const updateStatus = async () => {
            const progress = Math.round((sent + failed) / count * 100);
            const updatedEmbed = new WebEmbed()
                .setTitle('DM Spam Status')
                .setColor(shouldStop ? '#FF0000' : '#00FF00')
                .setDescription([
                    `Target: ${targetUser.tag}`,
                    `Progress: ${progress}%`,
                    `Messages Sent: ${sent}/${count}`,
                    `Failed: ${failed}`,
                `Anti-Captcha: ${config.CaptchaSettings?.Enabled ? 'Enabled' : 'Disabled'}`,
                    '',
                    'Type "stopdm" to stop'
                ].join('\n'));
            
            await statusMessage.edit({ 
                content: `${WebEmbed.hiddenEmbed}${updatedEmbed}` 
            });
        };

        // Setup captcha solver
        let solver = null;
        if (config.CaptchaSettings?.Enabled && config.CaptchaSettings?.ApiKey) {
            solver = new Solver(config.CaptchaSettings.ApiKey);
        }

        // Send messages
        for (let i = 0; i < count && !shouldStop; i++) {
            try {
                await targetUser.send(spamMessage);
                sent++;
                Logger.info(`Successfully sent DM ${sent}/${count} to ${targetUser.tag}`);
            } catch (error) {
                if (error.message.includes('captcha') && solver) {
                    try {
                        Logger.info('Captcha detected, attempting to solve...');
                        // Extract captcha data
                        const captchaData = {
                            sitekey: error.captcha?.siteKey || error.data?.sitekey,
                            url: 'discord.com',
                            rqdata: error.captcha?.rqdata || error.data?.rqdata,
                        };

                        // Solve captcha
                        const solution = await solver.hcaptcha(captchaData.sitekey, captchaData.url, {
                            invisible: 1,
                            data: captchaData.rqdata,
                            userAgent: error.captcha?.userAgent
                        });

                        // Retry with solved captcha
                        await targetUser.send(spamMessage, { captchaSolution: solution.data });
                        sent++;
                        Logger.info(`Captcha solved and message sent to ${targetUser.tag}`);
                        continue;
                    } catch (captchaError) {
                        Logger.expection(`Failed to solve captcha: ${captchaError.message}`);
                        failed++;
                    }
                } else {
                    failed++;
                    Logger.expection(`Failed to send DM to ${targetUser.tag}: ${error.message}`);
                    
                    // Break if user is blocking DMs
                    if (error.message.includes('Cannot send messages to this user')) {
                        shouldStop = true;
                        await message.channel.send('❌ Target user is blocking DMs. Stopping...');
                        break;
                    }
                }
            }

            await updateStatus();

            if (interval > 0 && i < count - 1 && !shouldStop) {
                await new Promise(resolve => setTimeout(resolve, interval * 1000));
            }
        }

        collector.stop();
        
        // Final update
        const finalEmbed = new WebEmbed()
            .setTitle('DM Spam Completed')
            .setColor(failed === count ? '#FF0000' : '#00FF00')
            .setDescription([
                `Target: ${targetUser.tag}`,
                `Total Messages: ${count}`,
                `Successfully Sent: ${sent}`,
                `Failed: ${failed}`
            ].join('\n'));

        await statusMessage.edit({ 
            content: `${WebEmbed.hiddenEmbed}${finalEmbed}` 
        });
    }
};