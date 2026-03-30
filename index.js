const http = require('http');
const mineflayer = require('mineflayer');

// Keep Render alive
http.createServer((req, res) => {
  res.end("Bot is running");
}).listen(3000);

const usernames = ['Ramesh', 'Suresh', 'Mukesh']; // simple names only
let currentIndex = 0;
let currentBot = null;

function startBot(index) {
  console.log(`🚀 Starting bot: ${usernames[index]}`);

  const bot = mineflayer.createBot({
    host: 'Nether_Forgers.aternos.me',
    port: 64102, // ✅ FIXED (Java port)
    username: usernames[index],
    version: '1.21.1' // ✅ SET YOUR VERSION
  });

  let walkTimer = null;

  function startWalking() {
    const directions = ['forward', 'back', 'left', 'right'];
    walkTimer = setInterval(() => {
      directions.forEach(dir => bot.setControlState(dir, false));
      const dir = directions[Math.floor(Math.random() * directions.length)];
      bot.setControlState(dir, true);
    }, 4000);
  }

  bot.once('spawn', () => {
    console.log(`✅ ${bot.username} joined`);

    bot.chat('/login 1984');

    setTimeout(() => {
      bot.chat(`Hello! I am ${bot.username}`);
      startWalking();
    }, 3000);

    // Remove old bot safely
    if (currentBot && currentBot !== bot) {
      console.log(`❌ Removing old bot: ${currentBot.username}`);
      currentBot.quit();
    }

    currentBot = bot;

    // Rotate after 30 mins
    setTimeout(() => {
      rotateBot(index);
    }, 30 * 60 * 1000);
  });

  function rotateBot(index) {
    const nextIndex = (index + 1) % usernames.length;
    console.log(`🔄 Switching to ${usernames[nextIndex]}`);

    if (walkTimer) clearInterval(walkTimer);

    bot.quit();

    setTimeout(() => {
      startBot(nextIndex);
    }, 20000); // ✅ 20 sec delay (prevents throttling)
  }

  bot.on('end', () => {
    console.log(`❌ ${bot.username} disconnected`);

    if (walkTimer) clearInterval(walkTimer);

    // Retry safely
    setTimeout(() => {
      startBot(index);
    }, 30000); // ✅ 30 sec delay (IMPORTANT)
  });

  bot.on('kicked', reason => {
    console.log(`🚫 ${bot.username} kicked: ${reason}`);

    if (walkTimer) clearInterval(walkTimer);

    setTimeout(() => {
      startBot(index);
    }, 30000);
  });

  bot.on('error', err => {
    console.log(`⚠️ Error (${bot.username}):`, err.message);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message === '!stop') {
      bot.chat('Stopping...');
      process.exit();
    }

    if (message === '!change') {
      rotateBot(index);
    }
  });
}

startBot(currentIndex);
