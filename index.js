const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'Nether_Forge.aternos.me',
  port: 22452,
  username: 'Prajwals_AFK_BOT',
  version: false,
});

let jumpInterval;

bot.once('spawn', () => {
  console.log('Bot has joined the server!');
  bot.chat('I am AFK!');

  // Start jumping every 10 seconds
  jumpInterval = setInterval(() => {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
  }, 10000);

  // Check time every 30 seconds
  setInterval(() => {
    const time = bot.time.timeOfDay;

    // Evening time in Minecraft: 12000 to 13000 (or even 14000+)
    if (time >= 12000 && time <= 23000) {
      bot.chat('It\'s evening, going to sleep...');
      clearInterval(jumpInterval); // Stop jumping
    } else {
      // Restart jump if it’s not already running
      if (!jumpInterval) {
        bot.chat('Good morning! Resuming AFK jump!');
        jumpInterval = setInterval(() => {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }, 10000);
      }
    }
  }, 30000); // Check every 30 seconds
});

// Reconnect on disconnect
bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting...');
  setTimeout(() => {
    require('child_process').fork(__filename);
  }, 5000);
});
