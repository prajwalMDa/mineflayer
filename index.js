const http = require('http');
const mineflayer = require('mineflayer');

// ✅ Keep Render alive
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(3000);

const usernames = ['Ramesh', 'Suresh'];
let currentIndex = 0;
let currentBot = null;

function startBot(index) {
  console.log(`🚀 Starting bot: ${usernames[index]}`);

  const bot = mineflayer.createBot({
    host: 'Nether_Forgers.aternos.me',
    port: 64102,
    username: usernames[index],
    version: '1.21.1'
  });

  let walkTimer = null;

  function startWalking() {
    const directions = ['forward', 'back', 'left', 'right'];

    walkTimer = setInterval(() => {
      try {
        directions.forEach(dir => bot.setControlState(dir, false));
        const dir = directions[Math.floor(Math.random() * directions.length)];
        bot.setControlState(dir, true);
      } catch (e) {}
    }, 5000); // ⬅️ slower (prevents invalid movement kick)
  }

  bot.once('spawn', () => {
    console.log(`✅ ${bot.username} joined`);

    // ⏳ Wait before login (VERY IMPORTANT)
    setTimeout(() => {
      bot.chat('/login 198419');
    }, 2000);

    // ⏳ Wait before movement (prevents "Invalid move packet")
    setTimeout(() => {
      bot.chat(`Hello! I am ${bot.username}`);
      startWalking();
    }, 8000);

    // Remove old bot
    if (currentBot && currentBot !== bot) {
      console.log(`❌ Removing old bot: ${currentBot.username}`);
      currentBot.quit();
    }

    currentBot = bot;

    // 🔄 Rotate after 30 min
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
    }, 30000); // ⬅️ more delay = no throttling
  }

  bot.on('end', () => {
    console.log(`❌ ${bot.username} disconnected`);

    if (walkTimer) clearInterval(walkTimer);

    // ❗ Prevent spam reconnect loop
    setTimeout(() => {
      startBot(index);
    }, 60000); // ⬅️ 60 sec (IMPORTANT FIX)
  });

  bot.on('kicked', reason => {
    console.log(`🚫 ${bot.username} kicked: ${reason}`);

    if (walkTimer) clearInterval(walkTimer);

    setTimeout(() => {
      startBot(index);
    }, 60000);
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
