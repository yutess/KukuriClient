const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'cal',
    description: 'Perform basic mathematical calculations',
    execute(message, args, client) {
        if (args.length < 3) {
            return message.reply('Please provide a valid calculation. Example: .cal 5 + 3');
        }

        const num1 = parseFloat(args[0]);
        const operator = args[1];
        const num2 = parseFloat(args[2]);

        if (isNaN(num1) || isNaN(num2)) {
            return message.reply('Please provide valid numbers for calculation.');
        }

        let result;
        let operation;

        switch (operator) {
            case '+':
                result = num1 + num2;
                operation = 'Addition';
                break;
            case '-':
                result = num1 - num2;
                operation = 'Subtraction';
                break;
            case '*':
                result = num1 * num2;
                operation = 'Multiplication';
                break;
            case '/':
                if (num2 === 0) {
                    return message.reply('Cannot divide by zero!');
                }
                result = num1 / num2;
                operation = 'Division';
                break;
            default:
                return message.reply('Invalid operator. Please use +, -, *, or /');
        }

        const embed = new WebEmbed()
            .setColor('#0099ff')
            .setTitle('Calculation Result')
            .setURL('https://github.com/Mikasuru/KukuriClient')
            .setDescription(`Operation: ${operation}\n\nExpression: ${num1} ${operator} ${num2}\nResult: ${result.toString()}`)
            
        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
    },
};