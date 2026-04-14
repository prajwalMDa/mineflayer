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
  let isReconnecting = false;

  function addTimer(fn, delay, repeat = false) {
    const t = repeat ? setInterval(fn, delay) : setTimeout(fn, delay);
    timers.push({ t, repeat });
  }

  function cleanup() {
    timers.forEach(({ t, repeat }) => repeat ? clearInterval(t) : clearTimeout(t));
    timers = [];
    spawned = false;
  }

  function reconnect(delay) {
    if (isReconnecting) return;
    isReconnecting = true;
    cleanup();
    console.log(`🔁 Reconnecting in ${delay / 1000}s...`);
    setTimeout(() => startBot(), delay);
  }

  function randomWalk() {
    const dirs = ['forward', 'back', 'left', 'right'];
    dirs.forEach(d => { try { bot.setControlState(d, false); } catch(e){} });
    const dir = dirs[rand(0, 3)];
    try { bot.setControlState(dir, true); } catch(e) {}
    setTimeout(() => {
      try { bot.setControlState(dir, false); } catch(e) {}
    }, rand(600, 1500));
  }

  function randomJump() {
    try {
      bot.setControlState('jump', true);
      setTimeout(() => {
        try { bot.setControlState('jump', false); } catch(e) {}
      }, 300);
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

  function randomSneak() {
    try {
      bot.setControlState('sneak', true);
      setTimeout(() => {
        try { bot.setControlState('sneak', false); } catch(e) {}
      }, rand(400, 900));
    } catch(e) {}
  }

  function swingArm() {
    try {
      bot.swingArm('right');
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

    // --- Anti-AFK Timers (tight intervals) ---

    // Walk every 8–15 seconds
    addTimer(randomWalk, rand(8000, 15000), true);

    // Look around every 5–10 seconds
    addTimer(randomLook, rand(5000, 10000), true);

    // Jump every 20–35 seconds
    addTimer(randomJump, rand(20000, 35000), true);

    // Sneak every 30–50 seconds
    addTimer(randomSneak, rand(30000, 50000), true);

    // Swing arm every 15–25 seconds
    addTimer(swingArm, rand(15000, 25000), true);

    // Send a random chat message every 4–8 minutes
    const afkMessages = ['.', 'ok', 'lol', 'hm', 'gg', 'nice', 'brb', 'hey'];
    addTimer(() => {
      try {
        bot.chat(afkMessages[rand(0, afkMessages.length - 1)]);
      } catch(e) {}
    }, rand(4 * 60000, 8 * 60000), true);
  });

  // React to AFK/idle warnings in chat
  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString().toLowerCase();
    if (msg.includes('afk') || msg.includes('idle') || msg.includes('kick')) {
      console.log('⚠️ AFK warning detected, moving now!');
      randomWalk();
      randomJump();
      randomLook();
    }
  });

  bot.on('end', (reason) => {
    console.log(`❌ Ramesh ended: ${reason}`);
    reconnect(20000);
  });

  bot.on('kicked', (reason) => {
    console.log(`🚫 Ramesh kicked: ${JSON.stringify(reason)}`);
    reconnect(30000);
  });

  bot.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}`);
    reconnect(20000);
  });
}

startBot();    isReconnecting = true;
    cleanup();
    console.log(`🔁 Reconnecting in ${delay / 1000}s...`);
    setTimeout(() => startBot(), delay);
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
  });

  // AFK detection only
  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString().toLowerCase();
    if (msg.includes('afk') || msg.includes('idle')) {
      randomWalk();
      randomJump();
    }
  });

  bot.on('end', (reason) => {
    console.log(`❌ Ramesh ended: ${reason}`);
    reconnect(20000);
  });

  bot.on('kicked', (reason) => {
    console.log(`🚫 Ramesh kicked: ${JSON.stringify(reason)}`);
    reconnect(20000);
  });

  bot.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}`);
    reconnect(20000);
  });
}

startBot();
