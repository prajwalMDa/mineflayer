const mineflayer = require('mineflayer');

const usernames = ['prazzu_bot_no1', 'prazzu_bot_no2', 'prazzu_bot_no3'];
let currentIndex = 0;
let currentBot = null;

function startBot(index) {
  const bot = mineflayer.createBot({
    host: 'Nether_Forge.aternos.me', // Replace with your server IP
    port: 22452,                      // Replace with your port
    username: usernames[index],
    version: false                   // Set your version manually if needed
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

  bot.once('spawn', () => {
    console.log(`Bot ${bot.username} has joined.`);

    bot.chat('/login 1984');  // Replace with your password if needed

    bot.chat(`Hello! I am ${bot.username}`);
    startConstantWalking();

    if (currentBot && currentBot !== bot) {
      console.log(`Disconnecting old bot: ${currentBot.username}`);
      currentBot.quit();
    }

    currentBot = bot;

    // Rotate bots every 30 minutes
    setTimeout(() => {
      const nextIndex = (index + 1) % usernames.length;
      startBot(nextIndex);
    }, 30 * 60 * 1000); // 30 minutes
  });

  bot.on('end', () => {
    console.log(`${bot.username} disconnected.`);
    if (currentBot === bot) currentBot = null;

    const nextIndex = (index + 1) % usernames.length;

    // Delay reconnect to avoid "connection throttled"
    setTimeout(() => {
      startBot(nextIndex);
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
