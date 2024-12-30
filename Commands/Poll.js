const { MessageEmbed } = require('discord.js-selfbot-v13');
const Logger = require('../Module/Logger');

module.exports = {
    name: 'poll',
    description: 'Create a poll with multiple options',
    async execute(message, args, client) {
        try {
            if (!args.length) {
                return message.reply('Please provide a question and options.\nUsage: .poll "Question" "Option1" "Option2" ["Option3" ...]');
            }

            const fullCommand = args.join(' ');
            const matches = fullCommand.match(/"[^"]+"/g);

            if (!matches || matches.length < 3) {
                return message.reply('Please provide a question and at least two options in quotes.\nUsage: .poll "Question" "Option1" "Option2" ["Option3" ...]');
            }

            const question = matches[0].replace(/^"|"$/g, '');
            const options = matches.slice(1).map(opt => opt.replace(/^"|"$/g, ''));

            if (options.length > 10) {
                return message.reply('You can only have up to 10 options in a poll.');
            }

            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

            // สร้าง embed
            const pollEmbed = new MessageEmbed()
                .setColor('#3498db')
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle('📊 ' + question)
                .setDescription(
                    options.map((option, index) => 
                        `${emojis[index]} ${option}`
                    ).join('\n\n')
                )
                .setFooter({ text: 'Poll active for 24 hours • React to vote!' })
                .setTimestamp();

            const pollMessage = await message.channel.send({ 
                content: '**New Poll Started!**',
                embeds: [pollEmbed] 
            });

            for (const emoji of emojis.slice(0, options.length)) {
                try {
                    await pollMessage.react(emoji);
                } catch (err) {
                    Logger.expection(`Failed to add reaction ${emoji}: ${err.message}`);
                }
            }

            setTimeout(async () => {
                try {
                    const fetchedMsg = await message.channel.messages.fetch(pollMessage.id);
                    
                    const results = options.map((option, index) => {
                        const reaction = fetchedMsg.reactions.cache.get(emojis[index]);
                        const count = reaction ? reaction.count - 1 : 0;
                        return `${emojis[index]} ${option}: **${count}** votes`;
                    }).join('\n\n');

                    const resultEmbed = new MessageEmbed()
                        .setColor('#2ecc71')
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                        .setTitle('📊 Poll Results: ' + question)
                        .setDescription(results)
                        .setFooter({ text: 'Poll has ended' })
                        .setTimestamp();

                    await message.channel.send({
                        content: '**Poll Results:**',
                        embeds: [resultEmbed]
                    });

                } catch (err) {
                    Logger.expection(`Failed to end poll: ${err.message}`);
                    message.channel.send('An error occurred while ending the poll.');
                }
            }, 24 * 60 * 60 * 1000);

        } catch (error) {
            Logger.expection(`Error in poll command: ${error.message}`);
            console.error('Full error:', error);
            return message.reply('An error occurred while creating the poll. Please try again later.');
        }
    },
};