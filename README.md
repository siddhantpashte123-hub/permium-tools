# Discord One-Time Announcer

A small interactive CLI for an official Discord **bot**. Choosing **Start** connects the bot and sends exactly one configured message to one configured channel. It does not repeat automatically.

```text
1 Start
2 Stop
3 Logs
4 Status
5 Exit
```

The bot token is requested with hidden terminal input and stays in memory only. The channel ID and message are configured in `.env`.

## Safety

- Uses an official bot token from the Discord Developer Portal; it does not support personal/user tokens or self-bots.
- Sends one message per explicit Start action, with no automatic repeats.
- Posts only to one configured channel, and suppresses mentions.
- Keep credentials private. If the bot token is exposed, reset it in the Discord Developer Portal.

## Setup

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Invite it to your server with permission to view and send messages in the target channel. The bot only needs the `Guilds` intent.
3. Install Node.js 20+, then run:

   ```sh
   npm install
   cp .env.example .env
   ```

4. Set `DISCORD_CHANNEL_ID` and your plain announcement in `.env`.
5. Run `npm start`, choose `1 Start`, and enter the **bot** token (input is hidden). The bot sends one message after connecting. To send another, use Stop, then explicitly Start again.

To copy a channel ID, enable Developer Mode in Discord, right-click the channel, and choose **Copy Channel ID**. On a VPS, run it in an interactive terminal such as `tmux`; Docker is not required.

## Verify

```sh
npm test
```
