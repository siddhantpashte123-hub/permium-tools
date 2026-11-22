require('dotenv').config();

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { Client, GatewayIntentBits, Events } = require('discord.js');

const MAX_MESSAGE_LENGTH = 2000;
const MAX_LOGS = 100;
const logs = [];
const state = { client: null, running: false, connecting: false, lastSentAt: null };

function log(message) {
  const line = `${new Date().toISOString()} ${message}`;
  logs.push(line);
  if (logs.length > MAX_LOGS) logs.shift();
  console.log(line);
}

function readConfig(env = process.env, token) {
  const channelId = (env.DISCORD_CHANNEL_ID || '').trim();
  const message = (env.MESSAGE || 'Hello from my Discord bot').trim();

  if (!token || !token.trim()) throw new Error('A Discord BOT token is required.');
  if (!/^\d{17,20}$/.test(channelId)) {
    throw new Error('DISCORD_CHANNEL_ID must be a Discord channel ID (17–20 digits). Set it in .env.');
  }
  if (!message) throw new Error('MESSAGE must not be empty.');
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`MESSAGE must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
  }

  return { token: token.trim(), channelId, message };
}

async function readSecret(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('A secure interactive terminal is required to enter the bot token.');
  }
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\u0003') return finish(new Error('Cancelled.'));
        if (char === '\r' || char === '\n') return finish();
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    stdin.on('data', onData);
  });
}

async function stopBot() {
  state.running = false;
  state.connecting = false;
  if (state.client) {
    const client = state.client;
    state.client = null;
    client.destroy();
  }
  log('Bot stopped.');
}

async function startBot(token) {
  if (state.running || state.connecting) {
    log('Bot is already running or connecting.');
    return;
  }

  let config;
  try {
    config = readConfig(process.env, token);
  } catch (error) {
    log(`Configuration error: ${error.message}`);
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  state.client = client;
  state.connecting = true;
  log('Connecting bot; one message will be sent after the bot connects.');

  client.once(Events.ClientReady, async () => {
    if (state.client !== client) return;
    state.connecting = false;
    state.running = true;
    log(`Signed in as ${client.user.tag}.`);

    try {
      const channel = await client.channels.fetch(config.channelId);
      if (!channel || !channel.isTextBased() || typeof channel.send !== 'function') {
        throw new Error('Configured channel is missing or does not support messages.');
      }
      await channel.send({ content: config.message, allowedMentions: { parse: [] } });
      state.lastSentAt = new Date();
      log(`One-time announcement sent to channel ${config.channelId}.`);
    } catch (error) {
      log(`Could not send announcement: ${error.message}`);
    }
  });

  client.on('error', (error) => log(`Discord client error: ${error.message}`));
  try {
    await client.login(config.token);
  } catch (error) {
    if (state.client === client) {
      state.client = null;
      state.connecting = false;
      state.running = false;
    }
    client.destroy();
    log(`Discord login failed: ${error.message}`);
  }
}

function printStatus() {
  const status = state.running ? 'running' : state.connecting ? 'connecting' : 'stopped';
  console.log(`Status: ${status}`);
  if (state.running || state.connecting) {
    console.log(`Last sent: ${state.lastSentAt ? state.lastSentAt.toISOString() : state.connecting ? 'waiting for Discord connection' : 'not sent (check Logs)'}`);
    console.log('Mode: one-time post only; no automatic repeats.');
  }
}

async function askLine(prompt) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    return await rl.question(prompt);
  } finally {
    rl.close();
  }
}

async function main() {
  console.log('Discord Channel Announcer — official bot account only.');
  console.log('Start sends one configured message; no automatic repeats. User-account tokens/self-bots are not supported.');

  while (true) {
    console.log('\n1 Start\n2 Stop\n3 Logs\n4 Status\n5 Exit');
    const choice = (await askLine('Choose an option: ')).trim();
    if (choice === '1') {
      try {
        const token = await readSecret('Discord BOT token (input hidden): ');
        await startBot(token);
      } catch (error) {
        log(error.message);
      }
    } else if (choice === '2') {
      await stopBot();
    } else if (choice === '3') {
      console.log(logs.length ? logs.join('\n') : 'No logs yet.');
    } else if (choice === '4') {
      printStatus();
    } else if (choice === '5') {
      await stopBot();
      break;
    } else {
      console.log('Invalid option. Choose 1, 2, 3, 4, or 5.');
    }
  }
}

if (require.main === module) void main();

module.exports = { readConfig, MAX_MESSAGE_LENGTH };
