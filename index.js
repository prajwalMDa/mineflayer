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

  function startWalking() {
    const directions = ['forward', 'back', 'left', 'right'];

    walkTimer = setInterval(() => {
      try {
        directions.forEach(dir => bot.setControlState(dir, false));
        const dir = directions[Math.floor(Math.random() * directions.length)];
        bot.setControlState(dir, true);
      } catch (e) {}
    }, 5000);
  }

  bot.once('spawn', () => {
    console.log(`✅ ${bot.username} joined`);

    // ⏳ Login delay
    setTimeout(() => {
      bot.chat('/login 198419');
    }, 2000);

    // ⏳ After login actions
    setTimeout(() => {
      bot.chat(`Hello! I am ${bot.username}`);

      // 🛏️ Try to sleep
      const bed = bot.findBlock({
        matching: block => block.name.includes('bed'),
        maxDistance: 5
      });

      if (bed) {
        bot.sleep(bed).then(() => {
          console.log(`😴 ${bot.username} is sleeping`);

          // Wake after 1 min
          setTimeout(() => {
            if (bot.isSleeping) {
              bot.wake().then(() => {
                console.log(`🌅 ${bot.username} woke up`);
                startWalking();
              });
            }
          }, 60000);

        }).catch(err => {
          console.log(`⚠️ Sleep failed: ${err.message}`);
          startWalking();
        });
      } else {
        console.log("❌ No bed nearby, walking instead");
        startWalking();
      }

    }, 8000);

    // Remove old bot
    if (currentBot && currentBot !== bot) {
      console.log(`❌ Removing old bot: ${currentBot.username}`);
      currentBot.quit();
    }

    currentBot = bot;

    // 🔄 Rotate every 25 min (Aternos safe)
    setTimeout(() => {
      rotateBot(index);
    }, 25 * 60 * 1000);
  });

  function rotateBot(index) {
    isRotating = true;

    const nextIndex = (index + 1) % usernames.length;
    console.log(`🔄 Switching to ${usernames[nextIndex]}`);

    if (walkTimer) clearInterval(walkTimer);

    bot.quit();

    setTimeout(() => {
      isRotating = false;
      startBot(nextIndex);
    }, 30000);
  }

  bot.on('end', () => {
    console.log(`❌ ${bot.username} disconnected`);

    if (walkTimer) clearInterval(walkTimer);

    if (isRotating) return;

    setTimeout(() => {
      console.log("🔁 Reconnecting...");
      startBot(index);
    }, 60000);
  });

  bot.on('kicked', reason => {
    console.log(`🚫 ${bot.username} kicked: ${reason}`);

    if (walkTimer) clearInterval(walkTimer);

    if (isRotating) return;

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
