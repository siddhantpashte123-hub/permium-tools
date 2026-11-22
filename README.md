# Discord Channel Announcer

A small interactive CLI for an official Discord **bot**. It posts one configured message to one configured channel on a schedule.

```text
1 Start
2 Stop
3 Logs
4 Status
5 Exit
```

The bot token is requested with hidden terminal input when you choose **Start** and stays in memory only. The channel, message, and interval are configured in `.env`.

## Safety

- This uses an official bot token from the Discord Developer Portal. It does not support personal/user tokens or self-bots.
- Repeated messages every 13 seconds are deliberately not supported. The minimum interval is one hour to avoid spam/rate-limit abuse.
- Posting starts only after a full interval; it does not send immediately on startup.
- The bot posts only in one configured channel, and mentions are suppressed.
- Never commit bot credentials. If a bot token is exposed, reset it in the Discord Developer Portal.

## Setup

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Invite it to your server with permission to view and send messages in the target channel. The bot only needs the `Guilds` intent.
3. Install Node.js 20+, then run:

   ```sh
   npm install
   cp .env.example .env
   ```

4. Set `DISCORD_CHANNEL_ID` in `.env`. `MESSAGE` defaults to `owo h`; change it if you want. `INTERVAL_HOURS` must be from 1 to 720.
5. Start the interactive CLI with `npm start`, choose `1 Start`, then enter the **bot** token (input is hidden). Use `2 Stop`, `3 Logs`, and `4 Status` as needed.

To copy a channel ID, enable Developer Mode in Discord, right-click the channel, and choose **Copy Channel ID**. For an interactive menu on a VPS, run it in a terminal session such as `tmux`.

## Verify

```sh
npm test
```
