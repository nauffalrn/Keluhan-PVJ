const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

let isReady = false;

client.on("qr", (qr) => {
  console.log("📱 Scan QR Code ini dengan WhatsApp kamu:");
  qrcode.generate(qr, { small: true });
  console.log("\n⏳ Menunggu scan QR...\n");
});

client.on("authenticated", () => {
  console.log("✅ Authenticated - Login berhasil!");
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot siap digunakan!");
  console.log("📱 Bot sudah terkoneksi dan siap menerima pesan\n");
  isReady = true;
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication gagal:", msg);
  console.log("💡 Coba hapus folder .wwebjs_auth dan restart");
});

client.on("disconnected", (reason) => {
  console.log("⚠️ Client disconnected:", reason);
  isReady = false;
});

// Fungsi helper untuk mengecek apakah bot sudah siap
client.isReady = () => isReady;

console.log("🔄 Menginisialisasi WhatsApp Client...");
client.initialize();

module.exports = client;
