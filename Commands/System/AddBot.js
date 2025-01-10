const { WebEmbed } = require('discord.js-selfbot-v13');
const { Solver } = require('2captcha');
const config = require('../../Config/Config.json');
const Logger = require('../../Module/Logger');

module.exports = {
    name: 'addbot2',
    description: 'Add bot with captcha bypass',
    category: 'System',
    aliases: ['invitebot2', 'botadd2'],
    cooldown: 5,
    usage: '.addbot2 <botId>',
    permissions: ['ADMINISTRATOR'],
    execute: async (message, args, client) => {
        if (!args[0]) return message.channel.send('Please provide a bot ID');
        if (!config.CaptchaSettings?.Enabled || !config.CaptchaSettings?.ApiKey) {
            return message.channel.send('Captcha solver not configured');
        }

        const botId = args[0];
        const solver = new Solver(config.CaptchaSettings.ApiKey);
        const permissions = '414501424448';
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=${permissions}&scope=bot%20applications.commands`;

        const statusMessage = await message.channel.send({ 
            content: `${WebEmbed.hiddenEmbed}${new WebEmbed()
                .setTitle('Bot Invite Status')
                .setColor('#ffff00')
                .setDescription('Starting bot invite...')}`
        });

        try {
            try {
                const solution = await solver.hcaptcha(
                    botId,
                    'discord.com',
                    {
                        invisible: 1
                    }
                );

                await message.guild.channels.fetch();
                await client.guilds.fetch(message.guild.id);
                
                const auth = {
                    authorize: true,
                    guild_id: message.guild.id,
                    permissions: permissions,
                    captchaSolution: solution.data
                };

                await client.rest.post(`/oauth2/authorize/${botId}`, { body: auth });

                const successEmbed = new WebEmbed()
                    .setTitle('Bot Invite Success')
                    .setColor('#00ff00')
                    .setDescription(`Bot ${botId} invited successfully!`);

                await statusMessage.edit({ 
                    content: `${WebEmbed.hiddenEmbed}${successEmbed}`
                });

            } catch (error) {
                if (error.message.includes('captcha')) {
                    Logger.expection(`Captcha error: ${error.message}`);
                }
                throw error;
            }
        } catch (error) {
            Logger.expection(`Bot invite error: ${error.message}`);
            const errorEmbed = new WebEmbed()
                .setTitle('Bot Invite Failed')
                .setColor('#ff0000')
                .setDescription(`Failed to invite bot: ${error.message}`);

            await statusMessage.edit({ 
                content: `${WebEmbed.hiddenEmbed}${errorEmbed}`
            });
        }
    }
};