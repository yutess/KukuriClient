const readline = require('readline');

const colors = {
  RESET: "\x1b[0m",
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
};

const icons = {
  INFO: "❇️",
  SUCCESS: "✅",
  WARNING: "⚠️",
  ERROR: "❌",
  DEBUG: "🔍",
};

function Logger(type, message) {
  let color, icon;

  switch (type.toUpperCase()) {
    case "INFO":
      color = colors.BLUE;
      icon = icons.INFO;
      break;
    case "SUCCESS":
      color = colors.GREEN;
      icon = icons.SUCCESS;
      break;
    case "WARNING":
      color = colors.YELLOW;
      icon = icons.WARNING;
      break;
    case "ERROR":
      color = colors.RED;
      icon = icons.ERROR;
      break;
    case "DEBUG":
      color = colors.MAGENTA;
      icon = icons.DEBUG;
      break;
    default:
      color = colors.RESET;
      icon = "";
  }

  console.log(`${color}[${type.toUpperCase()}] ${icon} : ${message}${colors.RESET}`);
}

function Prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${colors.RED}${question}${colors.RESET}`, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

module.exports = { Logger, Prompt };
