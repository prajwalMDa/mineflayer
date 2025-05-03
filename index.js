const mineflayer = require('mineflayer');

function createAFKBot() {
  const bot = mineflayer.createBot({
    host: 'Nether_Forge.aternos.me',
    port: 22452,
    username: 'Prajwals_AFK_BOT',
    version: false // Auto-detect version
  });

  let walking = false;
  let walkTimer = null;

  function startConstantWalking() {
    if (walking) return;
    walking = true;

    const directions = ['forward', 'back', 'left', 'right'];

    walkTimer = setInterval(() => {
      // Clear all directions first
      directions.forEach(dir => bot.setControlState(dir, false));

      // Pick a new random direction
      const dir = directions[Math.floor(Math.random() * directions.length)];
      bot.setControlState(dir, true);
    }, 3000); // Change direction every 3 seconds
  }

  function stopWalking() {
    walking = false;
    clearInterval(walkTimer);
    walkTimer = null;
    ['forward', 'back', 'left', 'right'].forEach(d => bot.setControlState(d, false));
  }

  bot.once('spawn', () => {
    console.log('Bot has joined the server!');
    bot.chat('AFK bot is here!');
    startConstantWalking();

    // Sleep logic
    setInterval(() => {
      const time = bot.time.timeOfDay;
      if (time >= 12000 && time <= 23000) {
        stopWalking();
        const bed = bot.findBlock({
          matching: block => bot.isABed(block),
          maxDistance: 10
        });

        if (bed) {
          bot.sleep(bed).then(() => {
            bot.chat('Good night!');
          }).catch(err => {
            bot.chat("Couldn't sleep: " + err.message);
          });
        } else {
          bot.chat("No bed found.");
        }
      } else {
        if (bot.isSleeping) {
          bot.wake().then(() => {
            bot.chat('Woke up, resuming walk!');
            startConstantWalking();
          });
        } else {
          startConstantWalking();
        }
      }
    }, 30000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === '!stop') {
      bot.chat('Stopping now...');
      bot.quit();
      process.exit();
    }
  });

  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting in 5s...');
    setTimeout(createAFKBot, 5000);
  });

  bot.on('error', err => {
    console.log('[ERROR]', err.message);
  });

  bot.on('kicked', reason => {
    console.log('[KICKED]', reason);
  });
}

createAFKBot();
