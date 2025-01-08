const fs = require('fs');

module.exports = {
    name: 'message',
    description: 'Sending a normal message.',
    category: 'Fun',
    aliases: ['gay'],
    cooldown: 5,
    usage: '.message [type] [message]',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        if (!args[0]) {
            message.delete();
            const reply = await message.channel.send('Plesae provide a number.\n1: Surveillance Message\n2: Child abuse\n3: Illegal investigation`');
            setTimeout(() => reply.delete(), 5000);
            return;
        } else if (!args[1]) {
            message.delete();
            const reply = await message.channel.send('Please provide a message.');
            setTimeout(() => reply.delete(), 2000);
            return;
        }
        message.delete();
        const content = args.slice(1).join(' ');
        if (args[0] === '1') return await message.channel.send(`${content}\n-# This user is under surveillance by the US FBI • [Learn More](<https://google.com>)\n-# Do not contact this user, they are the subject of a criminal case under 18 U.S.C § 2332b effective April 24, 2024 • [Learn More](<https://google.com>)`);
        if (args[0] === '2') return await message.channel.send(`${content}\n-# This user is under investigation by law enforcement authorities for violations related to child exploitation and abuse • [Learn More](<https://google.com>)\n-# The user is the subject of an ongoing criminal case under 18 U.S.C § 2251A, concerning the exploitation of minors, effective April 24, 2024 • [Learn More](<https://google.com>)`);
        if (args[0] === '3') return await message.channel.send(`${content}\n-# This user is under investigation for involvement in the illegal distribution and trafficking of child exploitation materials • [Learn More](<https://google.com>)\n-# The user is the subject of a criminal investigation under 18 U.S.C § 2252A, regarding the trafficking of child pornography, effective April 24, 2024 • [Learn More](<https://google.com>)`);

    },
};