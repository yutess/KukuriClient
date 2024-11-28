const notifier = require('node-notifier');
const fs = require('fs');
const { Client, Collection } = require('discord.js-selfbot-v13');

const { Logger } = require('./Module/Logger');
const Token = require("./Config/Token.json");
const Settings = require("./Config/Settings.json");

const client = new Client({
  checkUpdate: false
});

const prefix = Settings.prefix;

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

// Login to the client
client.login(Token.token);