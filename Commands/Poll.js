const { MessagePoll } = require('discord.js-selfbot-v13');
const Logger = require('../Module/Logger');

module.exports = {
    name: 'poll', // example: .poll "Message with the space" "One" "Question Two" "And the question three!"
    description: 'Create a poll with multiple options',
    async execute(message, args, client) {
        const fullCommand = args.join(' ');
        
        const matches = fullCommand.match(/"[^"]+"/g);

        if (!matches || matches.length < 3) {
            return message.reply('Please provide a question and at least two options in quotes. Usage: .poll "Question" "Option1" "Option2" ["Option3" ...]');
        }

        const question = matches[0].replace(/^"|"$/g, '');
        const options = matches.slice(1).map(opt => opt.replace(/^"|"$/g, ''));

        if (options.length > 10) {
            return message.reply('You can only have up to 10 options in a poll.');
        }

        const poll = new MessagePoll();
        poll.setQuestion(question);

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        options.forEach((option, index) => {
            poll.addAnswer({
                text: option,
                emoji: {
                    name: emojis[index],
                },
            });
        });

        poll.setAllowMultiSelect(false) // Multi Select: Enable ny true or false
            .setDuration(24); // 24 hours by default

        try {
            const msg = await message.channel.send({ poll });
            message.reply('Poll created successfully! It will end in 24 hours.');

            // End the poll after the duration
            setTimeout(async () => {
                await msg.endPoll();
                message.channel.send('The poll has ended. Check the results above!');
            }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
        } catch (error) {
            Logger.expection('Error creating poll:', error);
            message.reply('An error occurred while creating the poll. Please try again later.');
        }
    },
};