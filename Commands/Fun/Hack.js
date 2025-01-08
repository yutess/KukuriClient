module.exports = {
    name: 'hack',
    description: 'Fake hack a person',
    category: 'Fun',
    aliases: ['fakehack'],
    cooldown: 10,
    usage: '.hack [@user]\nExample: .hack @username',
    permissions: ['SEND_MESSAGES'],
    execute: async (message, args, client) => {
        try {
            const user = message.mentions.users.first() || message.author;

            const formatUserId = (id) => id.match(/.{1,4}/g).join(' ');

            const hackingMessage = await message.channel.send(`Initializing hack on ${user.username}...`);
            await delay(1500);

            await hackingMessage.edit(`Connecting to server... [█▒▒▒▒▒▒▒▒▒] 10%`);
            await delay(1000);
            await hackingMessage.edit(`Connecting to server... [█████▒▒▒▒▒] 50%`);
            await delay(200);
            await hackingMessage.edit(`Connecting to server... [██████▒▒▒▒] 60%`);
            await delay(200);
            await hackingMessage.edit(`Connecting to server... [███████▒▒▒] 70%`);
            await delay(200);
            await hackingMessage.edit(`Connecting to server... [████████▒▒] 80%`);
            await delay(200);
            await hackingMessage.edit(`Connecting to server... [█████████▒] 90%`);
            await delay(200);
            await hackingMessage.edit(`Connecting to server... [██████████] 100%`);
            await delay(1500);

            await hackingMessage.edit(`Accessing ${user.username}'s data...`);
            await delay(2000);
            await hackingMessage.edit(`Bypassing security protocols...`);
            await delay(2000);
            await hackingMessage.edit(`Extracting sensitive data...`);
            await delay(2000);

            const formattedUserId = formatUserId(user.id);
            await hackingMessage.edit(
                `\`\`\`\n=== Extracted Data ===\n` +
                `Email: ${user.username}12@gmail.com\n` +
                `Password: ${user.username}123@\n` +
                `IP Address: 192.168.0.1\n` +
                `Location: Earth, Milky Way\n` +
                `Credit Card: ${formattedUserId} (VISA)\n` +
                `Bank Account: 9876543210\n` +
                `Recent Logins:\n` +
                ` - Device: Windows PC, Location: York New\n` +
                ` - Device: Android Phone, Location: Tokyo\n` +
                `\`\`\``
            );
        } catch (error) {
            console.error('Error executing hack command:', error);
            message.channel.send('Something went wrong with the hack command. Please try again later.');
        }
    },
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
