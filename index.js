const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'Nether_Forge.aternos.me',
  port: 22452,
  username: 'PrajwalAFK', // You can change this name if you want
  version: false, // Auto-detects server version
});

bot.once('spawn', () => {
  console.log('Bot has joined the server!');
  bot.chat('I am AFK!');
});

setInterval(() => {
  bot.setControlState('jump', true);
  setTimeout(() => bot.setControlState('jump', false), 500);
}, 10000);

bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting...');
  setTimeout(() => {
    require('child_process').fork(__filename);
  }, 5000);
});
