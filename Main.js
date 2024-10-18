const notifier = require('node-notifier');
const fs = require('fs');
const path = require('path');
const { Client, WebhookClient, WebEmbed, Collection } = require('discord.js-selfbot-v13');
const client = new Client();

const { Logger } = require('./Module/Logger');
const Token = require("./Config/Token.json");
const Settings = require("./Config/Settings.json");
const User = require("./Config/Client.json");

const prefix = Settings.prefix;

client.commands = new Collection();

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./Commands/${file}`);
    client.commands.set(command.name, command);
}

for (const command of client.commands.values()) {
  if (command.init) {
      command.init(client);
  }
}

function Notify(message) {
  if (Settings.notification === true) {
    notifier.notify({
      title: 'Kukuri Client',
      message: `${message}`,
      sound: true,
      wait: false
    });
  } else {
    Logger("INFO", message);
  }
}

client.on('ready', async () => {
  Notify(`${client.user.username} is ready!`);
  Logger("INFO", `Logged in as ${client.user.tag}`);
  Logger("INFO", `Prefix is set to: ${prefix}`);
});

client.on("messageCreate", async message => {
  if (message.author.id !== client.user.id) return;
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  try {
    client.commands.get(commandName).execute(message, args, client);
  } catch (error) {
    Logger("ERROR", `There was an error executing the command: ${error}`);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(Token.token);