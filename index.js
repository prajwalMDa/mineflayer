const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'Nether_Forge.aternos.me',
  port: 22452,
  username: 'Prajwals_AFK_BOT',
  version: "1.20.4"
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

  // Staring + creepy messages
  const saidTo = new Set();
  const creepyMessages = [
    "Don't come closer...",
    "I'm watching you.",
    "You shouldn't be here.",
    "Too close... back off.",
    "You're not safe here.",
    "Why are you staring at me?"
  ];

  setInterval(() => {
    const player = Object.values(bot.players).find(p => {
      if (!p.entity) return false;
      const dist = bot.entity.position.distanceTo(p.entity.position);
      return p.username !== bot.username && dist < 6;
    });

    if (player && player.entity) {
      bot.lookAt(player.entity.position.offset(0, 1.6, 0));

      if (!saidTo.has(player.username)) {
        const msg = creepyMessages[Math.floor(Math.random() * creepyMessages.length)];
        bot.chat(msg);
        saidTo.add(player.username);
      }
    }
  }, 1000);

  // Reset memory every 30 seconds
  setInterval(() => {
    saidTo.clear();
  }, 30000);

  // Check time every 30 seconds for bed
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

// Listen to chat messages
bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  if (message === '!stop') {
    bot.chat('Stopping now... Bye!');
    setTimeout(() => {
      bot.quit();
      process.exit();
    }, 1000);
  }
});

// Reconnect on disconnect
bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting...');
  setTimeout(() => {
    require('child_process').fork(__filename);
  }, 5000);
});
