const test = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('./index');

const validEnv = {
  DISCORD_BOT_TOKEN: 'test-token',
  DISCORD_CHANNEL_ID: '123456789012345678',
  MESSAGE: 'Daily update',
  INTERVAL_HOURS: '24',
  ENABLED: 'false'
};

test('reads a valid configuration', () => {
  const config = readConfig(validEnv, 'test-token');
  assert.equal(config.intervalMs, 24 * 60 * 60 * 1000);
  assert.equal(config.message, 'Daily update');
});

test('rejects intervals shorter than one hour, including 13 seconds', () => {
  assert.throws(() => readConfig({ ...validEnv, INTERVAL_HOURS: '0.5' }, 'test-token'), /between 1 and 720/);
  assert.throws(() => readConfig({ ...validEnv, INTERVAL_HOURS: String(13 / 3600) }, 'test-token'), /between 1 and 720/);
});

test('rejects invalid channel IDs', () => {
  assert.throws(() => readConfig({ ...validEnv, DISCORD_CHANNEL_ID: 'not-a-channel' }, 'test-token'), /channel ID/);
});

test('rejects empty messages', () => {
  assert.throws(() => readConfig({ ...validEnv, MESSAGE: '   ' }, 'test-token'), /must not be empty/);
});
