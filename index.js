const http = require('http');
const mineflayer = require('mineflayer');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(3000);

const usernames = ['Ramesh', 'Suresh'];
let currentIndex = 0;
let currentBot = null;
let isRotating = false;

function startBot(index) {
  console.log(`🚀 Starting bot: ${usernames[index]}`);

  const bot = mineflayer.createBot({
    host: 'Nether_Forgers.aternos.me',
    port: 64102,
    username: usernames[index],
    version: '1.21.1'
  });

  let walkTimer = null;
  let rotateTimer = null;
  let spawned = false;

  function startWalking() {
    const directions = ['forward', 'back', 'left', 'right'];
    walkTimer = setInterval(() => {
      try {
        // Stop all directions first
        directions.forEach(dir => bot.setControlState(dir, false));
        // Pick random direction
        const dir = directions[Math.floor(Math.random() * directions.length)];
        bot.setControlState(dir, true);
        // Stop after 1 second
        setTimeout(() => {
          try { bot.setControlState(dir, false); } catch(e) {}
        }, 1000);
      } catch (e) {}
    }, 30000); // move every 30 seconds, not 5
  }

  function cleanup() {
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }
    if (rotateTimer) { clearTimeout(rotateTimer); rotateTimer = null; }
  }

  function rotateBot() {
    if (isRotating) return;
    isRotating = true;
    const nextIndex = (currentIndex + 1) % usernames.length;
    console.log(`🔄 Switching to ${usernames[nextIndex]}`);
    cleanup();
    try { bot.quit(); } catch(e) {}
    setTimeout(() => {
      currentIndex = nextIndex;
      isRotating = false;
      startBot(nextIndex);
    }, 15000); // wait 15s before next bot joins
  }

  bot.once('spawn', () => {
    if (spawned) return;
    spawned = true;
    console.log(`✅ ${bot.username} joined`);

    // Login silently (only if your server uses AuthMe plugin)
    setTimeout(() => {
      try { bot.chat('/login 198419'); } catch(e) {}
    }, 3000);

    // Start anti-AFK movement after 15s
    setTimeout(() => {
      startWalking();
    }, 15000);

    // Rotate every 25 minutes
    rotateTimer = setTimeout(() => {
      rotateBot();
    }, 25 * 60 * 1000);

    currentBot = bot;
  });

  bot.on('end', (reason) => {
    console.log(`❌ ${bot.username} disconnected: ${reason}`);
    cleanup();
    if (isRotating) return;
    // Reconnect after 60s
    setTimeout(() => startBot(currentIndex), 60000);
  });

  bot.on('kicked', (reason) => {
    console.log(`🚫 ${bot.username} kicked:`, JSON.stringify(reason));
    cleanup();
    if (isRotating) return;
    setTimeout(() => startBot(currentIndex), 60000);
  });

  bot.on('error', (err) => {
    console.log(`⚠️ Error (${bot.username}):`, err.message);
    cleanup();
  });

  // Only respond to !commands, nothing else
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === '!stop') process.exit();
    if (message === '!change') rotateBot();
    if (message === '!status') {
      // silent log only, no chat response
      console.log(`📊 Status check by ${username}`);
    }
  });
}

startBot(currentIndex);
