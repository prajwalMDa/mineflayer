const mineflayer = require('mineflayer');

const usernames = ['prazzu_bot_no1', 'prazzu_bot_no2', 'prazzu_bot_no3'];
let currentIndex = 0;
let currentBot = null;
let restarting = false;

function startBot(index) {
  if (restarting) return;
  restarting = true;

  const bot = mineflayer.createBot({
    host: 'Nether_Forgers.aternos.me',
    port: 64102,
    username: usernames[index]
  });

  let walkTimer = null;

  function startWalking() {
    const directions = ['forward', 'back', 'left', 'right'];
    walkTimer = setInterval(() => {
      directions.forEach(dir => bot.setControlState(dir, false));
      const dir = directions[Math.floor(Math.random() * directions.length)];
      bot.setControlState(dir, true);
    }, 3000);
  }

  function cleanUp() {
    if (walkTimer) clearInterval(walkTimer);
    if (bot) {
      ['forward','back','left','right'].forEach(d => bot.setControlState(d, false));
    }
  }

  bot.once('spawn', () => {
    console.log(`✅ ${bot.username} joined`);

    bot.chat('/login 1984');
    bot.chat(`Hello! I am ${bot.username}`);

    startWalking();

    if (currentBot && currentBot !== bot) {
      currentBot.quit();
    }

    currentBot = bot;
    restarting = false;

    // Rotate bot every 30 min
    setTimeout(() => {
      switchBot(index);
    }, 30 * 60 * 1000);
  });

  function switchBot(index) {
    cleanUp();
    if (currentBot) currentBot.quit();

    const nextIndex = (index + 1) % usernames.length;

    setTimeout(() => {
      restarting = false;
      startBot(nextIndex);
    }, 10000);
  }

  bot.on('end', () => {
    console.log(`❌ ${bot.username} disconnected`);
    cleanUp();
    switchBot(index);
  });

  bot.on('kicked', reason => {
    console.log(`🚫 ${bot.username} kicked:`, reason.toString());
    cleanUp();
    switchBot(index);
  });

  bot.on('error', err => {
    console.log(`⚠️ ${bot.username} error:`, err.message);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message === '!stop') {
      cleanUp();
      bot.quit();
      process.exit();
    }

    if (message === '!change') {
      cleanUp();
      switchBot(index);
    }
  });
}

startBot(currentIndex);      startBot(nextIndex);
    }, 10000); // 10 seconds
  });

  bot.on('kicked', reason => {
    console.log(`[KICKED] ${bot.username}:`, reason.toString());

    const nextIndex = (index + 1) % usernames.length;

    // Delay reconnect to avoid throttling
    setTimeout(() => {
      startBot(nextIndex);
    }, 10000); // 10 seconds
  });

  bot.on('error', err => {
    console.log(`[ERROR] ${bot.username}:`, err.message);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message === '!stop') {
      bot.chat('Stopping now...');
      bot.quit();
      process.exit();
    }

    if (message === '!change') {
      bot.chat('Changing bot now...');
      bot.quit();

      const nextIndex = (index + 1) % usernames.length;

      setTimeout(() => {
        startBot(nextIndex);
      }, 2000); // Slight delay before changing
    }
  });
}

startBot(currentIndex);
