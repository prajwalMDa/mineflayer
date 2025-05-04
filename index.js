const mineflayer = require('mineflayer');

const usernames = ['prazzu_bot_1', 'prazzu_bot_2', 'prazzu_bot_3'];
let currentIndex = 0;
let currentBot = null;

function startBot(index) {
  const bot = mineflayer.createBot({
    host: 'Nether_Forge.aternos.me',
    port: 22452,
    username: usernames[index],
    version: false
  });

  let walking = false;
  let walkTimer = null;

  function startConstantWalking() {
    if (walking) return;
    walking = true;

    const directions = ['forward', 'back', 'left', 'right'];
    walkTimer = setInterval(() => {
      directions.forEach(dir => bot.setControlState(dir, false));
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

  function handleSleeping() {
    setInterval(() => {
      const time = bot.time.timeOfDay;

      if (time >= 12000 && time <= 23000) { // Nighttime (12:00 - 23:00)
        stopWalking();
        const bed = bot.findBlock({
          matching: block => bot.isABed(block),
          maxDistance: 20 // Increased from 10 to 20
        });

        if (bed) {
          bot.sleep(bed).then(() => {
            bot.chat('Sleeping...');
          }).catch(err => {
            bot.chat("Couldn't sleep: " + err.message);
          });
        } else {
          bot.chat("No bed found within 20 blocks.");
        }
      } else {
        if (bot.isSleeping) {
          bot.wake().then(() => {
            bot.chat('Woke up, back to walking!');
            startConstantWalking();
          });
        } else {
          startConstantWalking();
        }
      }
    }, 30000); // Check every 30 seconds
  }

  bot.once('spawn', () => {
    console.log(`Bot ${bot.username} has joined.`);
    bot.chat(`Hello! I am ${bot.username}`);
    startConstantWalking();
    handleSleeping();

    if (currentBot && currentBot !== bot) {
      console.log(`Disconnecting old bot: ${currentBot.username}`);
      currentBot.quit();
    }

    currentBot = bot;

    // Set the next bot to join after 30 minutes
    setTimeout(() => {
      const nextIndex = (index + 1) % usernames.length;
      startBot(nextIndex); // Start the next bot
    }, 30 * 60 * 1000); // 30 minutes
  });

  bot.on('end', () => {
    console.log(`${bot.username} disconnected.`);
    if (currentBot === bot) currentBot = null;

    // When the current bot disconnects, immediately start the next bot
    const nextIndex = (index + 1) % usernames.length;
    startBot(nextIndex);
  });

  bot.on('error', err => {
    console.log(`[ERROR] ${bot.username}:`, err.message);
  });

  bot.on('kicked', reason => {
    console.log(`[KICKED] ${bot.username}:`, reason);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === '!stop') {
      bot.chat('Stopping now...');
      bot.quit();
      process.exit();
    }
  });
}

startBot(currentIndex);
