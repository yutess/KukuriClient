module.exports = {
    name: 'rps',
    description: 'Play rock paper scissors',
    category: 'Fun',
    aliases: ['rockpaperscissors'],
    cooldown: 3,
    usage: '.rps [rock/paper/scissors]\nExample: .rps rock',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const options = ['rock', 'paper', 'scissors'];
        const userChoice = args[0];
        if (!options.includes(userChoice)) {
            return message.channel.send('Please choose rock, paper, or scissors.');
        }
        const botChoice = options[Math.floor(Math.random() * options.length)];
        let result = '';
        if (userChoice === botChoice) {
            result = 'It\'s a tie!';
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'You win!';
        } else {
            result = 'You lose!';
        }
        message.channel.send(`You chose ${userChoice}, I chose ${botChoice}. ${result}`);
    },
};