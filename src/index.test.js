const test = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('./index');

const validEnv = {
  DISCORD_CHANNEL_ID: '123456789012345678',
  MESSAGE: 'A one-time announcement'
};

test('reads a valid one-time announcement configuration', () => {
  const config = readConfig(validEnv, 'test-bot-token');
  assert.equal(config.channelId, '123456789012345678');
  assert.equal(config.message, 'A one-time announcement');
  assert.equal(config.token, 'test-bot-token');
});

test('uses a neutral default message when MESSAGE is omitted', () => {
  const config = readConfig({ DISCORD_CHANNEL_ID: validEnv.DISCORD_CHANNEL_ID }, 'test-bot-token');
  assert.equal(config.message, 'Hello from my Discord bot');
});

test('rejects invalid channel IDs', () => {
  assert.throws(() => readConfig({ ...validEnv, DISCORD_CHANNEL_ID: 'not-a-channel' }, 'test-bot-token'), /channel ID/);
});

test('rejects empty messages', () => {
  assert.throws(() => readConfig({ ...validEnv, MESSAGE: '   ' }, 'test-bot-token'), /must not be empty/);
});

test('rejects messages over Discord content limit', () => {
  assert.throws(() => readConfig({ ...validEnv, MESSAGE: 'x'.repeat(2001) }, 'test-bot-token'), /2000 characters/);
});

test('requires a bot token', () => {
  assert.throws(() => readConfig(validEnv, ''), /BOT token is required/);
});
