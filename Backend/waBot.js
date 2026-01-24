const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true
  }
});

client.on('qr', qr => {
  console.log('📱 Scan QR ini');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('🔐 Authenticated');
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot siap!');
});

client.on('auth_failure', msg => {
  console.error('❌ AUTH FAILURE', msg);
});

client.initialize();

module.exports = client;
