const { Client } = require('discord.js-selfbot-v13');
const Token = require("./Config/Token.json");

const client = new Client({
  checkUpdate: false
});

client.login(Token.token);