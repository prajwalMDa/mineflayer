const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'Nether_Forge.aternos.me',
  port: 22452,
  username: 'Prajwals_AFK_BOT',
  version: false,
});

let jumpInterval = null;

function startJumping() {
  if (!jumpInterval) {
    bot.chat('Starting AFK jumps!');
    jumpInterval = setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 10000);
  }
}

function stopJumping() {
  if (jumpInterval) {
    clearInterval(jumpInterval);
    jumpInterval = null;
    bot.chat("Stopping jump to try sleeping...");
  }
}

bot.once('spawn', () => {
  console.log('Bot has joined the server!');
  bot.chat('I am AFK!');
  startJumping();

  // Check time every 30 seconds
  setInterval(() => {
    const time = bot.time.timeOfDay;

    if (time >= 12000 && time <= 23000) {
      stopJumping();

      const bed = bot.findBlock({
        matching: block => bot.isABed(block),
        maxDistance: 10
      });

      if (bed) {
        bot.sleep(bed).then(() => {
          bot.chat('Good night! I am sleeping...');
        }).catch(err => {
          bot.chat("Couldn't sleep: " + err.message);
        });
      } else {
        bot.chat("No bed nearby to sleep.");
      }
    } else {
      if (bot.isSleeping) {
        bot.wake().then(() => {
          bot.chat('Good morning!');
          startJumping();
        });
      } else {
        startJumping();
      }
    }
  }, 30000);
});

// Reconnect on disconnect
bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting...');
  setTimeout(() => {
    require('child_process').fork(__filename);
  }, 5000);
});
