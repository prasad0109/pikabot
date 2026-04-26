const express = require("express");
const app = express();

// Use Render port
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Web server running on port ${PORT}`);
});

const mineflayer = require('mineflayer');
const readline = require('readline');
const settings = require('./config/settings');
const { Client, GatewayIntentBits } = require('discord.js');

let bot;
let mining = false;

// ===== DISCORD SETUP =====
const DISCORD_TOKEN = process.env.TOKEN;
const CHANNEL_ID = "1474986602567565434";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== READLINE (optional local use) =====
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input.trim() && bot) {
    bot.chat(input);
  }
});

// ===== CREATE BOT =====
function createBot() {
  const name = process.argv[2] || "SilverMoon";
  console.log(`Creating bot... [${name}]`);

  let server = settings.server;

  bot = mineflayer.createBot({
    host: server.serverAddress,
    port: server.port,
    username: name,
    version: settings.botSettings.version
  });

  let password = settings.botSettings.password;

  bot.once('spawn', () => {
    console.log('Bot has spawned.');

    setTimeout(() => {
      bot.chat(`/login PRASAD09`);

      setTimeout(() => {
        bot.chat('/server survival');
      }, 3000);

    }, 5000);
  });

  // Send Minecraft chat → Discord
  bot.on('message', async (jsonMsg) => {
    const msg = jsonMsg.toString();
    console.log(msg);

    const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
    if (channel) {
      channel.send(`📩 ${msg}`);
    }

    if (msg.includes("Right click the")) {
      bot.chat('/server survival');
    }
  });

  bot.on('error', (err) => console.error(err));

  bot.on('end', () => {
    console.log('Reconnecting...');
    setTimeout(createBot, 5000);
  });
}

// ===== DISCORD COMMANDS =====
client.on('messageCreate', (message) => {
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.author.bot) return;

  // Send message to Minecraft
  if (bot) {
    bot.chat(message.content);
  }

  // Example commands
  if (message.content === "!jump") {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
  }

  if (message.content === "!come") {
    bot.chat("Coming!");
  }
});

// ===== START EVERYTHING =====
client.login(DISCORD_TOKEN);
createBot();
