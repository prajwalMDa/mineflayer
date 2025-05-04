const mineflayer = require('mineflayer');

const usernames = ['Prajwals_AFK_BOT_1', 'Prajwals_AFK_BOT_2', 'Prajwals_AFK_BOT_3'];
let currentIndex = 0;
let currentBot = null;
let reconnectTimeout = null;

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
    }, 3000);
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

      if (time >= 12000 && time <= 23000) {
        stopWalking();
        const bed = bot.findBlock({
          matching: block => bot.isABed(block),
          maxDistance: 20 // increased from 10 to 20
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
    }, 30000);
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

    setTimeout(() => {
      const nextIndex = (index + 1) % usernames.length;
      startBot(nextIndex);
    }, 30 * 60 * 1000); // 30 minutes
  });

  bot.on('end', () => {
    console.log(`${bot.username} disconnected.`);
    if (currentBot === bot) currentBot = null;

    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(() => {
        console.log(`Reconnecting bot ${bot.username}...`);
        reconnectTimeout = null;
        startBot(index);
      }, 10000);
    }
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
