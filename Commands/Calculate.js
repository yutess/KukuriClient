const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'cal',
    description: 'Perform basic mathematical calculations',
    execute(message, args, client) {
        if (args.length < 3) {
            return message.reply('Usage: .cal [number] [operator] [number]');
        }

        const num1 = Number(args[0]);
        const operator = args[1];
        const num2 = Number(args[2]);

        if (isNaN(num1) || isNaN(num2)) {
            return message.reply('Please provide valid numbers');
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
                return message.reply('Please use these operators: +, -, *, /');
        }

        const embed = new WebEmbed()
            .setColor('#0099ff')
            .setTitle('Calculation Result')
            .setDescription(`Operation: ${operation}\nExpression: ${num1} ${operator} ${num2}\nResult: ${result}`);

        message.channel.send({ content: `${WebEmbed.hiddenEmbed}${embed}` });
    },
};