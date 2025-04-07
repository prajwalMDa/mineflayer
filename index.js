const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

const bot = mineflayer.createBot({
  host: 'Nether_Forge.aternos.me',
  port: 22452,
  username: 'PrajwalAFK', // Change name if needed
  version: false, // Auto-detect version
});

// When bot joins the server
bot.once('spawn', () => {
  console.log('Bot has joined the server!');
  bot.chat('I am AFK!');
});

// Auto AFK jumping to avoid kick
setInterval(() => {
  bot.setControlState('jump', true);
  setTimeout(() => bot.setControlState('jump', false), 500);
}, 10000);

// Auto sleep at night
setInterval(() => {
  if (!bot.time.isDay) {
    const bed = bot.findBlock({
      matching: block => bot.isABed(block),
      maxDistance: 32
    });

    if (bed) {
      bot.chat('Trying to sleep...');
      bot.sleep(bed).then(() => {
        bot.chat('Good night!');
      }).catch(err => {
        bot.chat("Couldn't sleep: " + err.message);
      });
    } else {
      bot.chat('No bed nearby!');
    }
  }
}, 15000);

// Reconnect if disconnected
bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting...');
  setTimeout(() => {
    require('child_process').fork(__filename);
  }, 5000);
});
