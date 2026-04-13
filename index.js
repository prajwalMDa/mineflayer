const mineflayer = require('mineflayer');

let spawned = false;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startBot() {
  console.log('🚀 Starting Ramesh...');

  const bot = mineflayer.createBot({
    host: 'Nether_Forgers.aternos.me',
    port: 64102,
    username: 'Ramesh',
    version: '1.21.1',
    hideErrors: true,
    keepAlive: true
  });

  let timers = [];

  function addTimer(fn, delay, repeat = false) {
    const t = repeat ? setInterval(fn, delay) : setTimeout(fn, delay);
    timers.push({ t, repeat });
  }

  function cleanup() {
    timers.forEach(({ t, repeat }) => repeat ? clearInterval(t) : clearTimeout(t));
    timers = [];
    spawned = false;
  }

  function randomWalk() {
    const dirs = ['forward', 'back', 'left', 'right'];
    dirs.forEach(d => { try { bot.setControlState(d, false); } catch(e){} });
    const dir = dirs[rand(0, 3)];
    try { bot.setControlState(dir, true); } catch(e) {}
    setTimeout(() => {
      try { bot.setControlState(dir, false); } catch(e) {}
    }, rand(800, 2000));
  }

  function randomJump() {
    try {
      bot.setControlState('jump', true);
      setTimeout(() => {
        try { bot.setControlState('jump', false); } catch(e) {}
      }, 400);
    } catch(e) {}
  }

  function randomLook() {
    try {
      bot.look(
        (Math.random() * 2 - 1) * Math.PI,
        (Math.random() - 0.5) * (Math.PI / 3),
        true
      );
    } catch(e) {}
  }

  bot.once('spawn', () => {
    if (spawned) return;
    spawned = true;
    console.log('✅ Ramesh joined');

    // Login
    addTimer(() => {
      try { bot.chat('/login 198419'); } catch(e) {}
    }, rand(2000, 4000));

    // Anti AFK
    addTimer(randomWalk, rand(25000, 40000), true);
    addTimer(randomLook, rand(15000, 25000), true);
    addTimer(randomJump, rand(3, 5) * 60 * 1000, true);

    // Disconnect after 30 minutes then reconnect after 20 seconds
    addTimer(() => {
      console.log('🔄 30 min up — disconnecting...');
      cleanup();
      try { bot.quit(); } catch(e) {}
      setTimeout(() => startBot(), 20000);
    }, 30 * 60 * 1000);
  });

  // AFK detection
  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString().toLowerCase();
    if (msg.includes('afk') || msg.includes('idle')) {
      randomWalk();
      randomJump();
    }
  });

  bot.on('chat', (username, message) => {
    if (username === 'Ramesh') return;
    if (message === '!stop') process.exit();
  });

  bot.on('end', (reason) => {
    console.log(`❌ Ramesh ended: ${reason}`);
    cleanup();
    setTimeout(() => startBot(), 20000);
  });

  bot.on('kicked', (reason) => {
    console.log(`🚫 Ramesh kicked: ${JSON.stringify(reason)}`);
    cleanup();
    setTimeout(() => startBot(), 20000);
  });

  bot.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}`);
    cleanup();
    setTimeout(() => startBot(), 20000);
  });
}

startBot();
